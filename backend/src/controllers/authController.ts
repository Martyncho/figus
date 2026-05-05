import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

interface User {
    id: string;
    username: string;
    email?: string;
    provider: string;
}

/**
 * Register user (simple manual registration)
 */
export async function register(req: Request, res: Response) {
    try {
        const { username, email, password, name, provider = 'local' } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password required' });
        }

        // Check if user exists
        const checkUser = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (checkUser.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash, name, provider, provider_id, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, name, provider`,
            [username, email, hashedPassword, name || null, provider, `local_${Date.now()}`, null]
        );

        const user = result.rows[0];

        // Create token
        const token = jwt.sign(
            { id: user.id, username: user.username, provider: user.provider },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        const err = error as any;
        logger.error('Registration error: ' + (err?.message || err?.toString()));
        res.status(500).json({ error: 'Registration failed' });
    }
}

/**
 * Login user
 */
export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const result = await pool.query(
            'SELECT id, username, email, password_hash, name, provider FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Compare password with stored hash
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user.id, username: user.username, provider: user.provider },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
            },
        });
    } catch (error) {
        const err = error as any;
        logger.error('Login error: ' + (err?.message || err?.toString()));
        res.status(500).json({ error: 'Login failed' });
    }
}

/**
 * OAuth callback (Facebook, Instagram, TikTok)
 */
export async function oauthCallback(req: Request, res: Response) {
    try {
        const { provider, providerId, username, email, avatarUrl } = req.body;

        if (!provider || !providerId) {
            return res.status(400).json({ error: 'Provider and provider ID required' });
        }

        // Check if user exists
        let user = await pool.query(
            'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
            [provider, providerId]
        );

        // Create user if doesn't exist
        if (user.rows.length === 0) {
            const createResult = await pool.query(
                `INSERT INTO users (username, email, provider, provider_id, avatar_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, username, email, provider, avatar_url`,
                [username || `${provider}_${providerId}`, email, provider, providerId, avatarUrl]
            );
            user = createResult;
        }

        const userData = user.rows[0];

        // Create token
        const token = jwt.sign(
            {
                id: userData.id,
                username: userData.username,
                provider: userData.provider
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            status: 'OK',
            message: 'OAuth login successful',
            data: {
                user: userData,
                token,
            },
        });
    } catch (error) {
        logger.error('OAuth callback error', { error });
        res.status(500).json({ error: 'OAuth login failed' });
    }
}

/**
 * Verify token and return user data
 * Used for session recovery on app load
 */
export async function verifyToken(req: Request, res: Response) {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'Token required' });
        }

        const decoded: any = jwt.verify(token, JWT_SECRET);

        // Get full user data
        const result = await pool.query(
            'SELECT id, username, email, name, provider, avatar_url FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        res.json({
            status: 'OK',
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name,
                provider: user.provider,
            },
        });
    } catch (error) {
        logger.error('Token verification error', { error });
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Get current user
 */
export async function getCurrentUser(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'SELECT id, username, email, provider, avatar_url, created_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            status: 'OK',
            data: result.rows[0],
        });
    } catch (error) {
        logger.error('Error fetching current user', { error });
        res.status(500).json({ error: 'Failed to fetch user' });
    }
}

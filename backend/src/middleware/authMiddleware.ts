import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                username: string;
                provider: string;
            };
        }
    }
}

/**
 * Auth middleware - verifies JWT token
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.id,
            username: decoded.username,
            provider: decoded.provider,
        };
        next();
    } catch (error) {
        logger.error('Auth token verification failed', { error });
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

/**
 * Optional auth middleware - doesn't require token but sets user if provided
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
        try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            req.user = {
                id: decoded.id,
                username: decoded.username,
                provider: decoded.provider,
            };
        } catch (error) {
            logger.warn('Optional auth token verification failed', { error });
        }
    }

    next();
}

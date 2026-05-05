import { Router } from 'express';
import {
    register,
    login,
    oauthCallback,
    verifyToken,
    getCurrentUser,
} from '../controllers/authController';

const router = Router();

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', login);

/**
 * POST /api/auth/oauth
 * OAuth callback
 */
router.post('/oauth', oauthCallback);

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
router.post('/verify', verifyToken);

/**
 * GET /api/auth/me
 * Get current user (requires auth)
 */
router.get('/me', getCurrentUser);

export default router;

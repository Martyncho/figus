import { Router } from 'express';
import { getHealth, getStats } from '../controllers/healthController';

const router = Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', getHealth);

/**
 * GET /stats
 * System stats endpoint
 */
router.get('/stats', getStats);

export default router;

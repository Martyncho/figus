import { Router } from 'express';
import {
    createScan,
    getUserScans,
    getScanById,
    deleteScan,
    getScanStats,
} from '../controllers/scansController';

const router = Router();

/**
 * POST /api/scans
 * Create new scan (requires auth)
 */
router.post('/', createScan);

/**
 * GET /api/scans
 * Get user's scans (requires auth)
 */
router.get('/', getUserScans);

/**
 * GET /api/scans/stats
 * Get scan statistics (requires auth)
 */
router.get('/stats', getScanStats);

/**
 * GET /api/scans/:id
 * Get single scan (requires auth)
 */
router.get('/:id', getScanById);

/**
 * DELETE /api/scans/:id
 * Delete scan (requires auth)
 */
router.delete('/:id', deleteScan);

export default router;

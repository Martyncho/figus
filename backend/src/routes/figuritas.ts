import { Router } from 'express';
import {
    getAllFiguritas,
    getFiguritaById,
    getUserCollection,
    addFiguritaToCollection,
    removeFiguritaFromCollection,
    decreaseFiguritaQuantity,
    getMissingFiguritas,
    getCollectionStats,
} from '../controllers/figuritasController';

const router = Router();

/**
 * GET /api/figuritas
 * Get all figuritas from catalog
 */
router.get('/', getAllFiguritas);

/**
 * GET /api/figuritas/:id
 * Get single figurita
 */
router.get('/:id', getFiguritaById);

/**
 * GET /api/figuritas/collection/all
 * Get user's collection (requires auth)
 */
router.get('/collection/all', getUserCollection);

/**
 * GET /api/figuritas/collection/missing
 * Get missing figuritas (requires auth)
 */
router.get('/collection/missing', getMissingFiguritas);

/**
 * GET /api/figuritas/collection/stats
 * Get collection statistics (requires auth)
 */
router.get('/collection/stats', getCollectionStats);

/**
 * POST /api/figuritas/collection
 * Add figurita to collection (requires auth)
 */
router.post('/collection', addFiguritaToCollection);

/**
 * PATCH /api/figuritas/collection/:figurita_id
 * Decrease figurita quantity by 1 (requires auth)
 */
router.patch('/collection/:figurita_id', decreaseFiguritaQuantity);

/**
 * DELETE /api/figuritas/collection/:figurita_id
 * Remove figurita from collection (requires auth)
 */
router.delete('/collection/:figurita_id', removeFiguritaFromCollection);

export default router;

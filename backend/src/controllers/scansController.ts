import { Request, Response } from 'express';
import { pool } from '../config/database';
import logger from '../utils/logger';

/**
 * Create a new scan
 */
export async function createScan(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { figurita_id, foto_url, confidence_score = 0.0, tipo = 'camera' } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!tipo || !['camera', 'manual'].includes(tipo)) {
            return res.status(400).json({ error: 'Invalid scan type' });
        }

        const result = await pool.query(
            `INSERT INTO scans (user_id, figurita_id, foto_url, confidence_score, tipo)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [userId, figurita_id, foto_url, confidence_score, tipo]
        );

        res.status(201).json({
            status: 'OK',
            message: 'Scan created',
            data: result.rows[0],
        });
    } catch (error) {
        logger.error('Error creating scan', { error });
        res.status(500).json({ error: 'Failed to create scan' });
    }
}

/**
 * Get user's scans
 */
export async function getUserScans(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { limit = 50, offset = 0 } = req.query;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            `SELECT s.*, f.numero, f.nombre FROM scans s
       LEFT JOIN figuritas f ON s.figurita_id = f.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC
       LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );

        res.json({
            status: 'OK',
            data: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        logger.error('Error fetching scans', { error });
        res.status(500).json({ error: 'Failed to fetch scans' });
    }
}

/**
 * Get scan by ID
 */
export async function getScanById(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            `SELECT s.*, f.numero, f.nombre FROM scans s
       LEFT JOIN figuritas f ON s.figurita_id = f.id
       WHERE s.id = $1 AND s.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Scan not found' });
        }

        res.json({
            status: 'OK',
            data: result.rows[0],
        });
    } catch (error) {
        logger.error('Error fetching scan', { error });
        res.status(500).json({ error: 'Failed to fetch scan' });
    }
}

/**
 * Delete scan
 */
export async function deleteScan(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'DELETE FROM scans WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Scan not found' });
        }

        res.json({
            status: 'OK',
            message: 'Scan deleted',
            data: result.rows[0],
        });
    } catch (error) {
        logger.error('Error deleting scan', { error });
        res.status(500).json({ error: 'Failed to delete scan' });
    }
}

/**
 * Get scan statistics
 */
export async function getScanStats(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const totalScansResult = await pool.query(
            'SELECT COUNT(*) as total FROM scans WHERE user_id = $1',
            [userId]
        );

        const cameraScansResult = await pool.query(
            'SELECT COUNT(*) as total FROM scans WHERE user_id = $1 AND tipo = $2',
            [userId, 'camera']
        );

        const manualScansResult = await pool.query(
            'SELECT COUNT(*) as total FROM scans WHERE user_id = $1 AND tipo = $2',
            [userId, 'manual']
        );

        const totalScans = parseInt(totalScansResult.rows[0].total);
        const cameraScans = parseInt(cameraScansResult.rows[0].total);
        const manualScans = parseInt(manualScansResult.rows[0].total);

        res.json({
            status: 'OK',
            data: {
                totalScans,
                cameraScans,
                manualScans,
            },
        });
    } catch (error) {
        logger.error('Error fetching scan stats', { error });
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}

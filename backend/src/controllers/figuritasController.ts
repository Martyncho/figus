import { Request, Response } from 'express';
import { pool } from '../config/database';
import logger from '../utils/logger';

/**
 * Get all figuritas from catalog
 */
export async function getAllFiguritas(req: Request, res: Response) {
    try {
        const result = await pool.query(
            'SELECT id, numero, nombre, descripcion, imagen_url, rareza, anio, team, type FROM figuritas ORDER BY numero ASC'
        );

        res.json({
            status: 'OK',
            data: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        logger.error('Error fetching figuritas', { error });
        res.status(500).json({ error: 'Failed to fetch figuritas' });
    }
}

/**
 * Get figurita by ID
 */
export async function getFiguritaById(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'SELECT * FROM figuritas WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Figurita not found' });
        }

        res.json({
            status: 'OK',
            data: result.rows[0],
        });
    } catch (error) {
        logger.error('Error fetching figurita', { error });
        res.status(500).json({ error: 'Failed to fetch figurita' });
    }
}

/**
 * Get user's collection
 */
export async function getUserCollection(req: Request, res: Response) {
    try {
        const userId = req.user?.id; // From auth middleware

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            `SELECT 
        uf.id, 
        uf.figurita_id, 
        f.numero, 
        f.nombre, 
        f.descripcion, 
        f.imagen_url, 
        f.rareza,
        uf.cantidad,
        uf.created_at
      FROM user_figuritas uf
      JOIN figuritas f ON uf.figurita_id = f.id
      WHERE uf.user_id = $1
      ORDER BY f.numero ASC`,
            [userId]
        );

        res.json({
            status: 'OK',
            data: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        logger.error('Error fetching user collection', { error });
        res.status(500).json({ error: 'Failed to fetch collection' });
    }
}

/**
 * Add figurita to user collection
 */
export async function addFiguritaToCollection(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { figurita_id, cantidad = 1 } = req.body;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!figurita_id) {
            return res.status(400).json({ error: 'figurita_id is required' });
        }

        // Check if figurita exists
        const checkFigurita = await pool.query(
            'SELECT id FROM figuritas WHERE id = $1',
            [figurita_id]
        );

        if (checkFigurita.rows.length === 0) {
            return res.status(404).json({ error: 'Figurita not found' });
        }

        // Try to insert or update
        const result = await pool.query(
            `INSERT INTO user_figuritas (user_id, figurita_id, cantidad)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, figurita_id) 
       DO UPDATE SET cantidad = user_figuritas.cantidad + $3, updated_at = NOW()
       RETURNING *`,
            [userId, figurita_id, cantidad]
        );

        res.status(201).json({
            status: 'OK',
            message: 'Figurita added to collection',
            data: result.rows[0],
        });
    } catch (error) {
        logger.error('Error adding figurita to collection', { error });
        res.status(500).json({ error: 'Failed to add figurita' });
    }
}

/**
 * Remove figurita from collection
 */
export async function removeFiguritaFromCollection(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { figurita_id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            'DELETE FROM user_figuritas WHERE user_id = $1 AND figurita_id = $2 RETURNING *',
            [userId, figurita_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Figurita not found in collection' });
        }

        res.json({
            status: 'OK',
            message: 'Figurita removed from collection',
            data: result.rows[0],
        });
    } catch (error) {
        logger.error('Error removing figurita', { error });
        res.status(500).json({ error: 'Failed to remove figurita' });
    }
}

/**
 * Decrease figurita quantity by 1 (remove duplicate)
 */
export async function decreaseFiguritaQuantity(req: Request, res: Response) {
    try {
        const userId = req.user?.id;
        const { figurita_id } = req.params;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Get current quantity
        const checkResult = await pool.query(
            'SELECT cantidad FROM user_figuritas WHERE user_id = $1 AND figurita_id = $2',
            [userId, figurita_id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Figurita not found in collection' });
        }

        const currentQuantidad = checkResult.rows[0].cantidad;

        // If quantity is 1 or less, delete the figurita
        if (currentQuantidad <= 1) {
            const deleteResult = await pool.query(
                'DELETE FROM user_figuritas WHERE user_id = $1 AND figurita_id = $2 RETURNING *',
                [userId, figurita_id]
            );

            return res.json({
                status: 'OK',
                message: 'Figurita removed from collection',
                data: deleteResult.rows[0],
                deleted: true,
            });
        }

        // Otherwise, decrease quantity by 1
        const result = await pool.query(
            `UPDATE user_figuritas 
       SET cantidad = cantidad - 1, updated_at = NOW() 
       WHERE user_id = $1 AND figurita_id = $2 
       RETURNING *`,
            [userId, figurita_id]
        );

        res.json({
            status: 'OK',
            message: 'Figurita quantity decreased',
            data: result.rows[0],
            deleted: false,
        });
    } catch (error) {
        logger.error('Error decreasing figurita quantity', { error });
        res.status(500).json({ error: 'Failed to decrease figurita quantity' });
    }
}

/**
 * Get missing figuritas (faltantes)
 */
export async function getMissingFiguritas(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await pool.query(
            `SELECT f.* FROM figuritas f
       WHERE f.id NOT IN (
         SELECT figurita_id FROM user_figuritas WHERE user_id = $1
       )
       ORDER BY f.numero ASC`,
            [userId]
        );

        res.json({
            status: 'OK',
            data: result.rows,
            count: result.rows.length,
        });
    } catch (error) {
        logger.error('Error fetching missing figuritas', { error });
        res.status(500).json({ error: 'Failed to fetch missing figuritas' });
    }
}

/**
 * Get collection stats
 */
export async function getCollectionStats(req: Request, res: Response) {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const collectedResult = await pool.query(
            'SELECT COUNT(*) as total FROM user_figuritas WHERE user_id = $1',
            [userId]
        );

        const totalResult = await pool.query(
            'SELECT COUNT(*) as total FROM figuritas'
        );

        const collected = parseInt(collectedResult.rows[0].total);
        const total = parseInt(totalResult.rows[0].total);
        const missing = total - collected;
        const percentage = ((collected / total) * 100).toFixed(2);

        res.json({
            status: 'OK',
            data: {
                collected,
                total_figuritas: total,
                missing,
                percentage: parseFloat(percentage),
            },
        });
    } catch (error) {
        logger.error('Error fetching collection stats', { error });
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
}

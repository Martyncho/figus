import { Request, Response } from 'express';
import logger from '../utils/logger';

/**
 * Health Check Controller
 */

export async function getHealth(req: Request, res: Response) {
    try {
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '1.0.0',
        });
    } catch (error) {
        logger.error('Health check failed', { error });
        res.status(500).json({ error: 'Health check failed' });
    }
}

export async function getStats(req: Request, res: Response) {
    try {
        res.json({
            memory: process.memoryUsage(),
            cpu: process.cpuUsage(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
        });
    } catch (error) {
        logger.error('Stats endpoint failed', { error });
        res.status(500).json({ error: 'Stats endpoint failed' });
    }
}

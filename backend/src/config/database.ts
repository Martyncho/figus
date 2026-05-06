import { Pool, Client } from 'pg';
import logger from '../utils/logger';

/**
 * Database configuration
 * PostgreSQL connection pool
 */

// Use DATABASE_URL if available (for Supabase/Railway), otherwise use individual credentials
const databaseUrl = process.env.DATABASE_URL;
const poolConfig = databaseUrl 
    ? { 
        connectionString: databaseUrl,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
        ssl: { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'panini',
        user: process.env.DB_USER || 'panini_user',
        password: process.env.DB_PASSWORD || 'panini_dev_password',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
    logger.info('Database connected successfully');
});

pool.on('error', (err) => {
    logger.error('Unexpected error on idle client', { error: err });
});

/**
 * Test database connection
 */
export async function testConnection() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        logger.info('Database connection test successful', {
            timestamp: result.rows[0].now,
        });
        return true;
    } catch (err) {
        logger.error('Database connection test failed', { error: err });
        return false;
    }
}

/**
 * Get database version
 */
export async function getDatabaseVersion() {
    try {
        const result = await pool.query('SELECT version()');
        return result.rows[0].version;
    } catch (err) {
        logger.error('Failed to get database version', { error: err });
        throw err;
    }
}

/**
 * Execute query
 */
export async function query<T = any>(
    text: string,
    params?: any[]
): Promise<T[]> {
    try {
        const result = await pool.query(text, params);
        return result.rows;
    } catch (err) {
        logger.error('Database query failed', {
            query: text,
            error: err,
        });
        throw err;
    }
}

/**
 * Execute query returning single row
 */
export async function queryOne<T = any>(
    text: string,
    params?: any[]
): Promise<T | null> {
    const results = await query<T>(text, params);
    return results.length > 0 ? results[0] : null;
}

/**
 * Close database connection
 */
export async function closeConnection() {
    await pool.end();
    logger.info('Database connection closed');
}

export { pool };

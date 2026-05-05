import { readFileSync } from 'fs';
import { join } from 'path';
import { pool } from '../config/database';
import logger from '../utils/logger';

/**
 * Run database migrations
 */
async function runMigrations() {
    try {
        const schemaPath = join(process.cwd(), 'src/migrations/001_initial_schema.sql');
        const sql = readFileSync(schemaPath, 'utf-8');

        logger.info('Running migrations...');

        // Split by statements and filter empty ones
        const statements = sql
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

        for (const statement of statements) {
            await pool.query(statement);
        }

        logger.info('Migrations completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Migration failed', { error });
        process.exit(1);
    }
}

// Run migrations
runMigrations();

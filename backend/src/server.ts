import 'dotenv/config';
import http from 'http';
import app from './app';
import logger from './utils/logger';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Create HTTP server
const server = http.createServer(app);

// Start listening
server.listen(PORT, HOST, () => {
    logger.info(`🚀 Server running on http://${HOST}:${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Database configured: ${process.env.DATABASE_URL ? 'Supabase' : 'Local'}`);
});

// Error handler for server
server.on('error', (err: any) => {
    logger.error('Server error', { error: err });
    process.exit(1);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
    logger.error('Unhandled Rejection at:', { reason: reason.message, stack: reason.stack });
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
    process.exit(1);
});

export default server;

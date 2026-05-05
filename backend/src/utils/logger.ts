import pino from 'pino';

/**
 * Logger configuration
 * Utiliza Pino para logging estructurado
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = pino(
    {
        level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
        formatters: {
            level: (label) => {
                return { level: label.toUpperCase() };
            },
            bindings: () => ({
                // Información adicional en cada log
                timestamp: new Date().toISOString(),
                service: 'panini-api',
            }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    isDevelopment ? pino.transport({ target: 'pino-pretty' }) : undefined
);

export default logger;

/**
 * Uso:
 *
 * logger.info('Mensaje de información');
 * logger.error('Error', { error: err });
 * logger.debug('Debug info', { data: obj });
 * logger.warn('Warning', { warning: msg });
 */

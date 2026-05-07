import 'dotenv/config';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';

// Import routes
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import figuritasRoutes from './routes/figuritas';
import scansRoutes from './routes/scans';

// Import middleware
import { errorHandler, requestLogger } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Security middleware
app.use(helmet());
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(',') || ['*'],
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Request logging middleware
app.use(requestLogger);

// ============================================
// STATIC FILES & REACT FRONTEND
// ============================================

// Serve static files from the frontend build
app.use(express.static('public'));

// ============================================
// HEALTH CHECK & ROUTES
// ============================================

app.use('/health', healthRoutes);

// ============================================
// API ROUTES
// ============================================

// Public auth routes
app.use('/api/auth', authRoutes);

// Protected figuritas routes
app.use('/api/figuritas', authMiddleware, figuritasRoutes);

// Protected scans routes
app.use('/api/scans', authMiddleware, scansRoutes);

// ============================================
// REACT APP FALLBACK
// ============================================

// Serve React app for all non-API routes (for React Router SPA)
app.get('*', (req: Request, res: Response) => {
    res.sendFile('public/index.html', { root: process.cwd() });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req: Request, res: Response) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.url} not found`,
    });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

export default app;

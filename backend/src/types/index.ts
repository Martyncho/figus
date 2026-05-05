/**
 * Global Type Definitions
 */

// ============================================
// USUARIOS
// ============================================

export interface User {
    id: string;
    email: string;
    username: string;
    provider: 'facebook' | 'instagram' | 'tiktok';
    provider_id: string;
    avatar_url?: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserProfile extends User {
    figuritas_count: number;
    missing_count: number;
    total_figuritas: number;
}

// ============================================
// FIGURITAS
// ============================================

export interface Figurita {
    id: number;
    numero: number;
    nombre: string;
    descripcion?: string;
    imagen_url?: string;
    rareza: 'common' | 'rare' | 'special';
    anio: number;
    created_at: Date;
}

export interface FiguitaDetailed extends Figurita {
    tengo: boolean;
    cantidad: number;
    duplicados: number;
}

// ============================================
// COLECCIÓN DEL USUARIO
// ============================================

export interface UserFigurita {
    id: number;
    user_id: string;
    figurita_id: number;
    cantidad: number;
    created_at: Date;
    updated_at: Date;
}

export interface UserColeccion extends UserFigurita {
    figurita: Figurita;
}

// ============================================
// SCANS
// ============================================

export interface Scan {
    id: string;
    user_id: string;
    figurita_id?: number;
    foto_url?: string;
    confidence_score?: number;
    tipo: 'camera' | 'manual';
    created_at: Date;
}

export interface ScanResult {
    success: boolean;
    figurita_id?: number;
    numero?: number;
    confidence_score?: number;
    message: string;
}

// ============================================
// AUTENTICACIÓN
// ============================================

export interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
}

export interface JwtPayload {
    user_id: string;
    email: string;
    iat: number;
    exp: number;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

// ============================================
// ESTADÍSTICAS
// ============================================

export interface UserStats {
    user_id: string;
    total_figuritas_app: number;
    total_figuritas_tengo: number;
    total_figuritas_faltantes: number;
    porcentaje_completado: number;
    duplicados: number;
    rareza_stats: {
        common: number;
        rare: number;
        special: number;
    };
}

// ============================================
// ERRORES
// ============================================

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export const ErrorCodes = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    OAUTH_ERROR: 'OAUTH_ERROR',
    OCR_ERROR: 'OCR_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
};

// ============================================
// REQUEST BODIES
// ============================================

export interface ScanRequestBody {
    figurita_id?: number;
    numero?: number;
    foto_url?: string;
    tipo: 'camera' | 'manual';
}

export interface UpdateFiguitaBody {
    cantidad?: number;
}

export interface UserProfileUpdateBody {
    username?: string;
    avatar_url?: string;
}

// ============================================
// CLOUDINARY / AWS S3
// ============================================

export interface UploadResponse {
    url: string;
    key: string;
    size: number;
    content_type: string;
}

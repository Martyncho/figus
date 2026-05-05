import apiClient from './apiClient'

export interface User {
    id: string
    email: string
    username: string
    name?: string
}

export interface AuthResponse {
    token: string
    user: User
}

export interface LoginRequest {
    email: string
    password: string
}

export interface RegisterRequest {
    email: string
    password: string
    username: string
    name?: string
}

/**
 * Professional Auth Service with Token Recovery
 * Handles session persistence, token validation, and refresh
 */
export const authService = {
    /**
     * Register new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<any>('/api/auth/register', data)
        const token = response.token || response.data?.token
        const user = response.user || response.data?.user || { id: '', email: data.email, username: data.username, name: data.name }
        if (token) {
            apiClient.setToken(token)
        }
        return { token, user }
    },

    /**
     * Login user
     */
    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await apiClient.post<any>('/api/auth/login', data)
        // Handle both response formats
        const token = response.token || response.data?.token
        const user = response.user || response.data?.user || { id: '', email: data.email, username: '', name: '' }
        if (token) {
            apiClient.setToken(token)
        }
        return { token, user }
    },

    /**
     * Verify token is still valid (used on app mount for session recovery)
     */
    async verifyToken(token?: string): Promise<User | null> {
        try {
            const tokenToVerify = token || localStorage.getItem('authToken')
            if (!tokenToVerify) {
                return null
            }

            // Use apiClient.post for verification (backend expects POST)
            // apiClient.post returns the unwrapped user object directly
            const user = await apiClient.post<User>('/api/auth/verify', {}, tokenToVerify)

            if (!user || !user.id) {
                return null
            }

            return user
        } catch (error) {
            // Token is invalid or expired
            console.error('Token verification failed:', error)
            return null
        }
    },

    /**
     * Recover session from localStorage on app mount
     * Returns user if session is valid, null if invalid/expired
     */
    async recoverSession(): Promise<User | null> {
        try {
            const token = localStorage.getItem('authToken')
            console.log('[recoverSession] Token from localStorage:', token ? 'EXISTS' : 'NOT FOUND')
            if (!token) {
                return null
            }

            // Verify token is still valid
            console.log('[recoverSession] Calling verifyToken...')
            const user = await this.verifyToken(token)
            console.log('[recoverSession] verifyToken returned:', user ? user.username : 'null')

            if (!user) {
                // Token is invalid - clear it
                console.log('[recoverSession] verifyToken returned null, clearing token')
                this.logout()
                return null
            }

            console.log('[recoverSession] Session recovered successfully for user:', user.username)
            return user
        } catch (error) {
            console.error('[recoverSession] Error during session recovery:', error)
            this.logout()
            return null
        }
    },

    /**
     * Get current user
     */
    async getCurrentUser(token?: string): Promise<User> {
        return apiClient.get<User>('/api/auth/me', token)
    },

    async logout(): Promise<void> {
        apiClient.clearToken()
    },

    isAuthenticated(): boolean {
        return !!apiClient.getToken()
    },
}

export default authService

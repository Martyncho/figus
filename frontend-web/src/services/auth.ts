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

export const authService = {
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await apiClient.post<any>('/api/auth/register', data)
        const token = response.token || response.data?.token
        const user = response.user || response.data?.user || { id: '', email: data.email, username: data.username, name: data.name }
        if (token) {
            apiClient.setToken(token)
        }
        return { token, user }
    },

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

    async getCurrentUser(): Promise<User> {
        return apiClient.get<User>('/api/auth/me')
    },

    async logout(): Promise<void> {
        apiClient.clearToken()
    },

    isAuthenticated(): boolean {
        return !!apiClient.getToken()
    },
}

export default authService

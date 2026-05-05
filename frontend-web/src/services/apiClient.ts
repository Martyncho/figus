// Base API client with token management
// Use relative paths for browser-based requests (the Vite proxy will handle forwarding)
const API_BASE = ''

export interface ApiResponse<T> {
    data: T
    error: null
}

export interface ApiError {
    data: null
    error: string
}

const getToken = (): string | null => {
    return localStorage.getItem('authToken')
}

const setToken = (token: string): void => {
    localStorage.setItem('authToken', token)
}

const clearToken = (): void => {
    localStorage.removeItem('authToken')
}

export const apiClient = {
    async get<T>(endpoint: string, token?: string): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        const authToken = token || getToken()
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'GET',
            headers,
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        // Handle both wrapped (with data field) and unwrapped responses
        return data.data !== undefined ? data.data : data
    },

    async post<T>(endpoint: string, body?: any, token?: string): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        const authToken = token || getToken()
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers,
            body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        // Handle both wrapped (with data field) and unwrapped responses
        return data.data !== undefined ? data.data : data
    },

    async delete<T>(endpoint: string, token?: string): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        const authToken = token || getToken()
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers,
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        // Handle both wrapped (with data field) and unwrapped responses
        return data.data !== undefined ? data.data : data
    },

    async patch<T>(endpoint: string, body?: any, token?: string): Promise<T> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        const authToken = token || getToken()
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PATCH',
            headers,
            body: body ? JSON.stringify(body) : undefined,
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()
        // Handle both wrapped (with data field) and unwrapped responses
        return data.data !== undefined ? data.data : data
    },

    getToken,
    setToken,
    clearToken,
}

export default apiClient

import apiClient from './apiClient'

export interface Figurita {
    id: string
    numero: number
    nombre: string
    equipo?: string
    posicion?: string
    imagen_url?: string
}

export interface UserFigurita {
    id: string
    figurita_id: string
    user_id: string
    cantidad: number
    created_at: string
    figurita: Figurita
}

export interface CollectionStats {
    total_figuritas: number
    collected: number
    missing: number
    percentage: number
}

export const figuritasService = {
    async getAllFiguritas(): Promise<Figurita[]> {
        const response = await apiClient.get<any>('/api/figuritas')
        // Handle both wrapped and unwrapped responses
        return Array.isArray(response) ? response : (response.data || [])
    },

    async getUserCollection(): Promise<UserFigurita[]> {
        const response = await apiClient.get<any>('/api/figuritas/collection/all')
        // Handle both wrapped and unwrapped responses
        return Array.isArray(response) ? response : (response.data || [])
    },

    async getMissingFiguritas(): Promise<Figurita[]> {
        const response = await apiClient.get<any>('/api/figuritas/collection/missing')
        // Handle both wrapped and unwrapped responses
        return Array.isArray(response) ? response : (response.data || [])
    },

    async getCollectionStats(): Promise<CollectionStats> {
        const response = await apiClient.get<any>('/api/figuritas/collection/stats')
        // Handle both wrapped and unwrapped responses
        return typeof response === 'object' && !Array.isArray(response) && response.data ? response.data : response
    },

    async addFiguritaToCollection(figuritaId: string, cantidad: number = 1): Promise<UserFigurita> {
        const response = await apiClient.post<any>('/api/figuritas/collection', {
            figurita_id: figuritaId,
            cantidad,
        })
        // Handle both wrapped and unwrapped responses
        return typeof response === 'object' && !Array.isArray(response) && response.data ? response.data : response
    },

    async removeFiguritaFromCollection(figuritaId: string): Promise<void> {
        await apiClient.delete(`/api/figuritas/collection/${figuritaId}`)
    },
}

export default figuritasService

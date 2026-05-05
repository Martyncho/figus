import apiClient from './apiClient'

export interface Scan {
    id: string
    user_id: string
    figurita_id?: string
    foto_url?: string
    confidence_score?: number
    tipo: 'camera' | 'manual'
    created_at: string
    figurita?: any
}

export interface ScanStats {
    total_scans: number
    camera_scans: number
    manual_scans: number
}

export interface CreateScanRequest {
    figurita_id?: string
    foto_url?: string
    confidence_score?: number
    tipo: 'camera' | 'manual'
}

export const scansService = {
    async createScan(data: CreateScanRequest): Promise<Scan> {
        return apiClient.post<Scan>('/api/scans', data)
    },

    async getUserScans(page: number = 1, limit: number = 10): Promise<Scan[]> {
        return apiClient.get<Scan[]>(`/api/scans?page=${page}&limit=${limit}`)
    },

    async getScanStats(): Promise<ScanStats> {
        return apiClient.get<ScanStats>('/api/scans/stats')
    },

    async getScanById(scanId: string): Promise<Scan> {
        return apiClient.get<Scan>(`/api/scans/${scanId}`)
    },

    async deleteScan(scanId: string): Promise<void> {
        await apiClient.delete(`/api/scans/${scanId}`)
    },
}

export default scansService

"use server"

import axiosInstance from '@/lib/axios-instance'
import type { Connection } from '@/lib/types'

interface ApiResponse {
  success: boolean
  message: string
  data: Array<{
    connectionId: string
    status: string
    qrCode?: string
    createdAt: string
    lastActivity?: string
    name?: string
    clientInfo?: {
      phoneNumber?: string
      platform?: string
      phoneDetails?: {
        manufacturer?: string
        model?: string
        osVersion?: string
        appVersion?: string
      }
      whatsappInfo?: {
        profileName?: string
        profilePicture?: string
        isBusiness?: boolean
        isVerified?: boolean
      }
      connectionDetails?: {
        ipAddress?: string
        userAgent?: string
        connectedAt?: string
        lastSeen?: string
      }
    }
    message?: string
    needsRestore?: boolean
  }>
}

export async function getConnections(apiKey: string): Promise<Connection[]> {
  try {
    const response = await axiosInstance.get<ApiResponse>('/connections', {
      headers: {
        'x-api-key': apiKey,
      },
    })

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch connections')
    }

    // Transform API response to our Connection type
    const connections: Connection[] = response.data.data.map(apiConnection => ({
      connectionId: apiConnection.connectionId,
      status: apiConnection.status as Connection['status'],
      qrCode: apiConnection.qrCode,
      createdAt: apiConnection.createdAt,
      lastActivity: apiConnection.lastActivity,
      name: apiConnection.name,
      clientInfo: apiConnection.clientInfo,
      message: apiConnection.message,
      needsRestore: apiConnection.needsRestore,
    }))

    return connections
  } catch (error) {
    console.error('Failed to fetch connections:', error)
    throw error
  }
}

"use server"

import axiosInstance from '@/lib/axios-instance'
import type { Connection } from '@/lib/types'

interface ApiResponse {
  success: boolean
  message: string
  data: {
    connectionId: string
    status: string
    qrCode?: string
    createdAt: string
    lastActivity?: string
    name?: string
  }
}

export async function addNewConnection(
  name: string,
  apiKey: string
): Promise<Connection> {
  try {
    const response = await axiosInstance.post<ApiResponse>('/connections', {
      name
    }, {
      headers: {
        'x-api-key': apiKey,
      },
    })

    const apiData = response.data.data
    
    // Transform API response to our Connection type
    const connection: Connection = {
      id: apiData.connectionId,
      deviceName: apiData.name || name,
      status: apiData.status as Connection['status'],
      qrCode: apiData.qrCode,
      createdAt: apiData.createdAt,
    }

    return connection
  } catch (error) {
    console.error('Failed to create connection:', error)
    throw error
  }
}

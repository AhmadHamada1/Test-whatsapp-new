"use server"

import axiosInstance from '@/lib/axios-instance'
import type { Connection } from '@/lib/types'

export async function getConnectionStatus(
  connectionId: string
): Promise<Connection> {
  try {
    const response = await axiosInstance.get(`/connections/${connectionId}`)
    return response.data
  } catch (error) {
    console.error('Failed to get connection status:', error)
    throw error
  }
}

"use server"

import axiosInstance from '@/lib/axios-instance'
import type { Connection } from '@/lib/types'

export async function getConnections(): Promise<Connection[]> {
  try {
    const response = await axiosInstance.get('/connections')
    return response.data
  } catch (error) {
    console.error('Failed to fetch connections:', error)
    throw error
  }
}

"use server"

import axiosInstance from '@/lib/axios-instance'
import type { Connection } from '@/lib/types'

export async function addNewConnection(
  name: string,
): Promise<Connection> {
  try {
    const response = await axiosInstance.post('/connections', {
      name
    })

    return response.data
  } catch (error) {
    console.error('Failed to create connection:', error)
    throw error
  }
}

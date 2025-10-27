"use server"

import axiosInstance from '@/lib/axios-instance'

export async function disconnectConnection(
  connectionId: string,
  apiKey: string
): Promise<{ message: string; id: string }> {
  try {
    const response = await axiosInstance.delete(`/connections/${connectionId}`, {
      headers: {
        'x-api-key': apiKey,
      },
    })
    return response.data
  } catch (error) {
    console.error('Failed to disconnect connection:', error)
    throw error
  }
}

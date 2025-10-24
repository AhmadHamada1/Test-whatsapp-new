"use server"

import axiosInstance from '@/lib/axios-instance'

interface RestoreResponse {
  success: boolean
  message: string
  data: {
    success: boolean
    message: string
    status: string
  }
}

export async function restoreConnection(
  connectionId: string,
  apiKey: string
): Promise<{ success: boolean; message: string; status: string }> {
  try {
    const response = await axiosInstance.post<RestoreResponse>(
      `/connections/${connectionId}/restore`,
      {},
      {
        headers: {
          'x-api-key': apiKey,
        },
      }
    )

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to restore connection')
    }

    return response.data.data
  } catch (error) {
    console.error('Failed to restore connection:', error)
    throw error
  }
}

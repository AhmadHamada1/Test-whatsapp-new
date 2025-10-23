"use server"

import axiosInstance, { baseURL } from '@/lib/axios-instance'

export interface ApiKeyVerificationResponse {
  status: string
}

export async function verifyApiKey(apiKey: string): Promise<ApiKeyVerificationResponse> {
  try {
    // Create a temporary axios instance for the health check since it's outside the v1/wa path
    const healthResponse = await axiosInstance.get('health/api-key', {
      headers: {
        'x-api-key': apiKey,
      },
      baseURL: baseURL,
    })

    return healthResponse.data
  } catch (error) {
    console.error('Failed to verify API key:', error)
    throw error
  }
}

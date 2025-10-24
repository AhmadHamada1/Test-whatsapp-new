"use server"

import axiosInstance from '@/lib/axios-instance'
import type { Message } from '@/lib/types'

export async function sendMessage(
  connectionId: string,
  phoneNumber: string,
  message: string,
  apiKey: string
): Promise<Message> {
  try {
    const response = await axiosInstance.post(`/connections/${connectionId}/message`, {
      to: phoneNumber,
      content: message,
      type: "text"
    }, {
      headers: {
        'x-api-key': apiKey,
      },
    })
    
    // The API returns { success: true, message: string, data: Message }
    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.message || 'Failed to send message')
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    throw error
  }
}
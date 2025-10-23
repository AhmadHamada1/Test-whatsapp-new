"use server"

import axiosInstance from '@/lib/axios-instance'
import type { Message } from '@/lib/types'

export async function sendMessage(
  connectionId: string,
  phoneNumber: string,
  message: string
): Promise<Message> {
  try {
    const response = await axiosInstance.post('/connections/:id/message', {
      connectionId,
      phoneNumber,
      message,
    })
    
    return response.data
  } catch (error) {
    console.error('Failed to send message:', error)
    throw error
  }
}
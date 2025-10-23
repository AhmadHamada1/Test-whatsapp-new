"use server"

import axiosInstance from '@/lib/axios-instance'
import type { Message } from '@/lib/types'

export async function getMessages(
  connectionId: string
): Promise<Message> {
  try {
    const response = await axiosInstance.get(`/connections/${connectionId}/message`, {})

    return response.data
  } catch (error) {
    console.error('Failed to get messages:', error)
    throw error
  }
}
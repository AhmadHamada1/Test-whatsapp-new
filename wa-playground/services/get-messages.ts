"use server"

import axiosInstance from '@/lib/axios-instance'
import type { Message } from '@/lib/types'

export interface GetMessagesResponse {
  messages: Message[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
  stats: {
    total: number
    sent: number
    received: number
    byStatus: Record<string, number>
    byType: Record<string, number>
  }
}

export interface GetMessagesParams {
  limit?: number
  offset?: number
  direction?: 'sent' | 'received'
  status?: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
}

export async function getMessages(
  connectionId: string,
  params: GetMessagesParams = {}
): Promise<GetMessagesResponse> {
  try {
    const queryParams = new URLSearchParams()
    
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())
    if (params.direction) queryParams.append('direction', params.direction)
    if (params.status) queryParams.append('status', params.status)

    const queryString = queryParams.toString()
    const url = `/connections/${connectionId}/messages${queryString ? `?${queryString}` : ''}`
    
    const response = await axiosInstance.get(url)

    // The API returns { success: true, message: string, data: GetMessagesResponse }
    if (response.data.success && response.data.data) {
      return response.data.data
    } else {
      throw new Error(response.data.message || 'Failed to get messages')
    }
  } catch (error) {
    console.error('Failed to get messages:', error)
    throw error
  }
}
"use server"

import { createServerHttp } from './http'

export type Connection = {
  id: string
  status: 'pending' | 'ready' | 'disconnected'
  lastQrAt?: string
  readyAt?: string
  disconnectedAt?: string
  createdAt: string
  accountInfo?: {
    phoneNumber?: string
    whatsappId?: string
    profileName?: string
    platform?: string
    profilePictureUrl?: string
    statusMessage?: string
    lastSeen?: string
  }
}

export async function getConnections(apiKeyId: string): Promise<Connection[]> {
  const http = await createServerHttp()
  const { data } = await http.get<{ data: Connection[] }>(`/wa/admin/connections/${apiKeyId}`)
  return data.data
}

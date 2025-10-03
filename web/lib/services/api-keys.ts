"use server"

import { createServerHttp } from './http'

export type ServerApiKey = {
  _id: string
  label: string
  tokenPrefix?: string
  status: 'active' | 'revoked'
  createdAt: string
  updatedAt?: string
  revokedAt?: string | null
}

export async function listApiKeys(): Promise<ServerApiKey[]> {
  const http = await createServerHttp()
  const { data } = await http.get<{ keys: ServerApiKey[] }>(`/api-keys`)
  return data.keys
}

export async function createApiKey(label?: string): Promise<{ token: string; key: ServerApiKey }> {
  const http = await createServerHttp()
  const { data } = await http.post<{ token: string; key: ServerApiKey }>(`/api-keys`, label ? { label } : {})
  return data
}

export async function revokeApiKey(id: string): Promise<ServerApiKey> {
  const http = await createServerHttp()
  const { data } = await http.post<{ key: ServerApiKey }>(`/api-keys/${id}/revoke`)
  return data.key
}

export async function activateApiKey(id: string): Promise<ServerApiKey> {
  const http = await createServerHttp()
  const { data } = await http.post<{ key: ServerApiKey }>(`/api-keys/${id}/activate`)
  return data.key
}

export async function getApiKey(id: string): Promise<ServerApiKey> {
  const http = await createServerHttp()
  const { data } = await http.get<{ key: ServerApiKey }>(`/api-keys/${id}`)
  return data.key
}

export async function deleteApiKey(id: string): Promise<void> {
  const http = await createServerHttp()
  await http.delete(`/api-keys/${id}`)
}



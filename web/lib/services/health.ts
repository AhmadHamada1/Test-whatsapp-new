"use server"

import { createServerHttp } from './http'

export type HealthStatus = 'healthy' | 'pending' | 'disconnected' | 'unhealthy' | 'error'

export type ApiKeyHealth = {
  status: HealthStatus
  message: string
  timestamp: string
  connections: {
    total: number
    ready: number
    pending: number
    disconnected: number
  }
  apiKey: {
    id: string
    valid: boolean
  }
  error?: string
}

export type SystemHealth = {
  status: 'healthy' | 'unhealthy'
  message: string
  timestamp: string
  services: {
    database: {
      status: string
      responseTime?: string
      error?: string
    }
    api: {
      status: string
      version: string
    }
  }
  error?: string
}

export async function checkApiKeyHealth(apiKeyToken: string): Promise<ApiKeyHealth> {
  const http = await createServerHttp()
  const { data } = await http.get<{ data: ApiKeyHealth }>(`/health`, {
    headers: {
      'x-api-key': apiKeyToken
    }
  })
  return data.data
}

export async function checkSystemHealth(): Promise<SystemHealth> {
  const http = await createServerHttp()
  const { data } = await http.get<{ data: SystemHealth }>(`/health/system`)
  return data.data
}

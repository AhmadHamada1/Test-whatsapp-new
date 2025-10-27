"use server"

import { createServerHttp } from './http'

export type ApiCallLog = {
  _id: string
  endpoint: string
  method: string
  responseStatus: number
  responseTime?: number
  createdAt: string
  userAgent?: string
  ipAddress?: string
  error?: string
}

export type ApiCallStats = {
  totalCalls: number
  successCalls: number
  errorCalls: number
  avgResponseTime: number
  endpoints: Array<{
    endpoint: string
    method: string
    status: number
  }>
}

export type ApiCallLogsResponse = {
  logs: ApiCallLog[]
  total: number
  limit: number
  offset: number
}

export async function getApiCallLogs(
  apiKeyId: string, 
  options: {
    limit?: number
    offset?: number
    endpoint?: string
    method?: string
    status?: number
    startDate?: string
    endDate?: string
  } = {}
): Promise<ApiCallLogsResponse> {
  const http = await createServerHttp()
  const params = new URLSearchParams()
  
  if (options.limit) params.append('limit', options.limit.toString())
  if (options.offset) params.append('offset', options.offset.toString())
  if (options.endpoint) params.append('endpoint', options.endpoint)
  if (options.method) params.append('method', options.method)
  if (options.status) params.append('status', options.status.toString())
  if (options.startDate) params.append('startDate', options.startDate)
  if (options.endDate) params.append('endDate', options.endDate)

  const queryString = params.toString()
  const url = `/api-call-logs/${apiKeyId}${queryString ? `?${queryString}` : ''}`
  
  const { data } = await http.get<{ data: ApiCallLogsResponse }>(url)
  return data.data
}

export async function getApiCallStats(
  apiKeyId: string,
  options: {
    startDate?: string
    endDate?: string
  } = {}
): Promise<ApiCallStats> {
  const http = await createServerHttp()
  const params = new URLSearchParams()
  
  if (options.startDate) params.append('startDate', options.startDate)
  if (options.endDate) params.append('endDate', options.endDate)

  const queryString = params.toString()
  const url = `/api-call-logs/${apiKeyId}/stats${queryString ? `?${queryString}` : ''}`
  
  const { data } = await http.get<{ data: ApiCallStats }>(url)
  return data.data
}

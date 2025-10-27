// Connection Types
export type ConnectionStatus = "waiting_connection" | "ready" | "disconnected" | "needs_restore" | "error"

export interface ClientInfo {
  phoneNumber?: string
  platform?: string
  phoneDetails?: {
    manufacturer?: string
    model?: string
    osVersion?: string
    appVersion?: string
  }
  whatsappInfo?: {
    profileName?: string
    profilePicture?: string
    isBusiness?: boolean
    isVerified?: boolean
  }
  connectionDetails?: {
    ipAddress?: string
    userAgent?: string
    connectedAt?: string
    lastSeen?: string
  }
}

export interface Connection {
  connectionId: string
  status: ConnectionStatus
  qrCode?: string
  createdAt: string
  lastActivity?: string
  name?: string
  clientInfo?: ClientInfo
  message?: string
  needsRestore?: boolean
}

// Connection Types
export type ConnectionStatus = "requesting_qr" | "waiting_connection" | "connected" | "disconnected" | "error"

export interface Connection {
  connectionId: string
  status: ConnectionStatus
  qrCode?: string
  createdAt: string
  lastActivity?: string
  name?: string
}

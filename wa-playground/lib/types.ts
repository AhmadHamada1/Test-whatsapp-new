export type ConnectionStatus = "connected" | "disconnected" | "pending"

export interface Connection {
  id: string
  deviceName: string
  deviceDetail?: string
  status: ConnectionStatus
  createdAt: string
  qrCode?: string
}

export type MessageStatus = "sent" | "delivered" | "failed" | "pending"

export interface Message {
  id: string
  connectionId: string
  phoneNumber: string
  message: string
  status: MessageStatus
  timestamp: string
}

export interface ApiContextType {
  apiKey: string | null
  setApiKey: (key: string) => void
  connections: Connection[]
  addConnection: (connection: Omit<Connection, "id" | "createdAt">) => void
  addConnectionFromApi: (connection: Connection) => void
  disconnectConnection: (id: string) => void
  loadConnections: () => Promise<void>
  isLoadingConnections: boolean
  connectionsError: string | null
  messages: Message[]
  sendMessage: (connectionId: string, phoneNumber: string, message: string) => void
  getMessagesByConnection: (connectionId: string) => Message[]
}

// API Context Types
import type { Connection } from './connection'
import type { Message } from './message'

export interface ApiContextType {
  apiKey: string | null
  setApiKey: (key: string) => void
  connections: Connection[]
  addConnection: (connection: Omit<Connection, "connectionId" | "createdAt">) => void
  addConnectionFromApi: (connection: Connection) => void
  disconnectConnection: (connectionId: string) => void
  loadConnections: () => Promise<void>
  isLoadingConnections: boolean
  connectionsError: string | null
  messages: Message[]
  sendMessage: (connectionId: string, phoneNumber: string, message: string) => Promise<Message | void>
  getMessagesByConnection: (connectionId: string) => Message[]
  isSendingMessage: boolean
  sendMessageError: string | null
}

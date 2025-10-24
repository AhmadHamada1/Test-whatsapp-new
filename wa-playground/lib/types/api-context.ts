// API Context Types
import type { Connection } from './connection'
import type { Message } from './message'
import type { GetMessagesParams, GetMessagesResponse } from '@/services/get-messages'

export interface ApiContextType {
  apiKey: string | null
  setApiKey: (key: string) => void
  connections: Connection[]
  addConnectionFromApi: (connection: Connection) => void
  disconnectConnection: (connectionId: string) => Promise<void>
  restoreConnection: (connectionId: string) => Promise<void>
  loadConnections: () => Promise<void>
  isLoadingConnections: boolean
  connectionsError: string | null
  messages: Message[]
  sendMessage: (connectionId: string, phoneNumber: string, message: string) => Promise<Message | void>
  getMessagesByConnection: (connectionId: string) => Message[]
  loadMessages: (connectionId: string, params?: GetMessagesParams) => Promise<GetMessagesResponse | void>
  isSendingMessage: boolean
  sendMessageError: string | null
  isLoadingMessages: boolean
  messagesError: string | null
  messagesStats: Record<string, GetMessagesResponse['stats']>
  getLoadingState: (connectionId: string, action: string) => boolean
  setLoadingState: (connectionId: string, action: string, isLoading: boolean) => void
}

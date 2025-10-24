"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ApiContextType, Connection, Message, MessageStatus } from "@/lib/types"
import { getConnections } from "@/services/get-connections"
import { sendMessage as sendMessageApi } from "@/services/send-message"
import { getMessages as getMessagesApi, type GetMessagesParams, type GetMessagesResponse } from "@/services/get-messages"
import { disconnectConnection as disconnectConnectionApi } from "@/services/disconnection-connection"
import { restoreConnection as restoreConnectionApi } from "@/services/restore-connection"

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingConnections, setIsLoadingConnections] = useState(false)
  const [connectionsError, setConnectionsError] = useState<string | null>(null)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [sendMessageError, setSendMessageError] = useState<string | null>(null)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [messagesError, setMessagesError] = useState<string | null>(null)
  const [messagesByConnection, setMessagesByConnection] = useState<Record<string, Message[]>>({})
  const [messagesStats, setMessagesStats] = useState<Record<string, GetMessagesResponse['stats']>>({})

  // Load API key from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("api_key")
    if (storedApiKey) {
      setApiKeyState(storedApiKey)
      // Load connections from API when API key is available
      loadConnections()
    }
  }, [])

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    localStorage.setItem("api_key", key)
    // Load connections from API when API key is set
    loadConnections()
  }

  // Function to add connection from API response (with real ID and timestamps)
  const addConnectionFromApi = (connection: Connection) => {
    const updatedConnections = [...connections, connection]
    setConnections(updatedConnections)
    // No localStorage - connections are managed by the API
  }

  const disconnectConnection = async (connectionId: string) => {
    if (!apiKey) {
      console.error("API key is required to disconnect connection")
      return
    }

    try {
      // Call the API to disconnect the connection
      await disconnectConnectionApi(connectionId, apiKey)
      
      // Reload connections from database to get updated state
      await loadConnections()
    } catch (error) {
      console.error('Failed to disconnect connection:', error)
      throw error
    }
  }

  const restoreConnection = async (connectionId: string) => {
    if (!apiKey) {
      console.error("API key is required to restore connection")
      return
    }

    try {
      // Call the API to restore the connection
      await restoreConnectionApi(connectionId, apiKey)
      
      // Reload connections from database to get updated state
      await loadConnections()
    } catch (error) {
      console.error('Failed to restore connection:', error)
      throw error
    }
  }

  const sendMessage = async (connectionId: string, phoneNumber: string, message: string) => {
    if (!apiKey) {
      setSendMessageError("API key is required to send messages")
      return
    }

    setIsSendingMessage(true)
    setSendMessageError(null)

    try {
      // Call the real API
      const sentMessage = await sendMessageApi(connectionId, phoneNumber, message, apiKey)
      
      // Add the message to local state (no localStorage)
      const updatedMessages = [...messages, sentMessage]
      setMessages(updatedMessages)
      
      return sentMessage
    } catch (error: any) {
      console.log("Error sending message:", error.response?.data?.message)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      setSendMessageError(errorMessage)
      console.error('Failed to send message:', error)
      throw error
    } finally {
      setIsSendingMessage(false)
    }
  }

  const getMessagesByConnection = (connectionId: string) => {
    return messagesByConnection[connectionId] || []
  }

  const loadMessages = async (connectionId: string, params: GetMessagesParams = {}) => {
    if (!apiKey) {
      setMessagesError("API key is required to load messages")
      return
    }

    setIsLoadingMessages(true)
    setMessagesError(null)

    try {
      const response = await getMessagesApi(connectionId, params, apiKey)
      
      // Update messages for this connection
      setMessagesByConnection(prev => ({
        ...prev,
        [connectionId]: response.messages
      }))
      
      // Update stats for this connection
      setMessagesStats(prev => ({
        ...prev,
        [connectionId]: response.stats
      }))
      
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages'
      setMessagesError(errorMessage)
      console.error('Failed to load messages:', error)
      throw error
    } finally {
      setIsLoadingMessages(false)
    }
  }

  const loadConnections = async () => {
    if (!apiKey) {
      setConnectionsError("API key is required to load connections")
      return
    }

    setIsLoadingConnections(true)
    setConnectionsError(null)
    
    try {
      const fetchedConnections = await getConnections(apiKey)
      console.log('Fetched connections:', fetchedConnections)
      setConnections(fetchedConnections)
    } catch (error) {
      console.error('Failed to load connections:', error)
      setConnectionsError(error instanceof Error ? error.message : 'Failed to load connections')
      // Clear connections on error since we don't have localStorage fallback
      setConnections([])
    } finally {
      setIsLoadingConnections(false)
    }
  }

  return (
    <ApiContext.Provider
      value={{
        apiKey,
        setApiKey,
        connections,
        addConnectionFromApi,
        disconnectConnection,
        restoreConnection,
        loadConnections,
        isLoadingConnections,
        connectionsError,
        messages,
        sendMessage,
        getMessagesByConnection,
        loadMessages,
        isSendingMessage,
        sendMessageError,
        isLoadingMessages,
        messagesError,
        messagesStats,
      }}
    >
      {children}
    </ApiContext.Provider>
  )
}

export function useApi() {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error("useApi must be used within an ApiProvider")
  }
  return context
}

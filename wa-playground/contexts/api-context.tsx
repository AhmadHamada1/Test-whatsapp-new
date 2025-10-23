"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ApiContextType, Connection, Message, MessageStatus } from "@/lib/types"
import { getConnections } from "@/services/get-connections"
import { sendMessage as sendMessageApi } from "@/services/send-message"
import { getMessages as getMessagesApi, type GetMessagesParams, type GetMessagesResponse } from "@/services/get-messages"

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

  // Load data from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("api_key")
    if (storedApiKey) setApiKeyState(storedApiKey)
    loadConnections()
  }, [])

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    localStorage.setItem("api_key", key)
  }

  const addConnection = (connection: Omit<Connection, "connectionId" | "createdAt">) => {
    const newConnection: Connection = {
      ...connection,
      connectionId: Math.random().toString(36).substring(7),
      createdAt: new Date().toISOString(),
    }
    const updatedConnections = [...connections, newConnection]
    setConnections(updatedConnections)
    localStorage.setItem("connections", JSON.stringify(updatedConnections))
  }

  // Function to add connection from API response (with real ID and timestamps)
  const addConnectionFromApi = (connection: Connection) => {
    const updatedConnections = [...connections, connection]
    setConnections(updatedConnections)
    localStorage.setItem("connections", JSON.stringify(updatedConnections))
  }

  const disconnectConnection = (connectionId: string) => {
    const updatedConnections = connections.map((conn) =>
      conn.connectionId === connectionId ? { ...conn, status: "disconnected" as const } : conn,
    )
    setConnections(updatedConnections)
    localStorage.setItem("connections", JSON.stringify(updatedConnections))
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
      const sentMessage = await sendMessageApi(connectionId, phoneNumber, message)
      
      // Add the message to local state
      const updatedMessages = [...messages, sentMessage]
      setMessages(updatedMessages)
      localStorage.setItem("messages", JSON.stringify(updatedMessages))
      
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
      const response = await getMessagesApi(connectionId, params)
      
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
    setIsLoadingConnections(true)
    setConnectionsError(null)
    
    try {
      const fetchedConnections = await getConnections()
      console.log('Fetched connections:', fetchedConnections)
      setConnections(fetchedConnections)
    } catch (error) {
      alert('Failed to load connections')
      console.error('Failed to load connections:', error)
      setConnectionsError(error instanceof Error ? error.message : 'Failed to load connections')
      // Keep existing connections from localStorage if API fails
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
        addConnection,
        addConnectionFromApi,
        disconnectConnection,
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

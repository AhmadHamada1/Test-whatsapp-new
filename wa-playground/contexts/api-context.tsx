"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ApiContextType, Connection, Message, MessageStatus } from "@/lib/types"
import { getConnections } from "@/services/get-connections"

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoadingConnections, setIsLoadingConnections] = useState(false)
  const [connectionsError, setConnectionsError] = useState<string | null>(null)

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

  const sendMessage = (connectionId: string, phoneNumber: string, message: string) => {
    const newMessage: Message = {
      messageId: Math.random().toString(36).substring(7),
      connectionId,
      to: phoneNumber,
      content: message,
      type: "text",
      status: "pending",
      sentAt: new Date().toISOString(),
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    localStorage.setItem("messages", JSON.stringify(updatedMessages))

    // Simulate message status updates
    setTimeout(() => {
      const statuses: MessageStatus[] = ["sent", "delivered", "failed"]
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      const finalMessages = updatedMessages.map((msg) =>
        msg.messageId === newMessage.messageId ? { ...msg, status: randomStatus } : msg,
      )
      setMessages(finalMessages)
      localStorage.setItem("messages", JSON.stringify(finalMessages))
    }, 2000)
  }

  const getMessagesByConnection = (connectionId: string) => {
    return messages.filter((msg) => msg.connectionId === connectionId)
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

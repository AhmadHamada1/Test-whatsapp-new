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
    const storedConnections = localStorage.getItem("connections")
    const storedMessages = localStorage.getItem("messages")

    if (storedApiKey) setApiKeyState(storedApiKey)
    if (storedConnections) setConnections(JSON.parse(storedConnections))
    if (storedMessages) setMessages(JSON.parse(storedMessages))
  }, [])

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    localStorage.setItem("api_key", key)
  }

  const addConnection = (connection: Omit<Connection, "id" | "createdAt">) => {
    const newConnection: Connection = {
      ...connection,
      id: Math.random().toString(36).substring(7),
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

  const disconnectConnection = (id: string) => {
    const updatedConnections = connections.map((conn) =>
      conn.id === id ? { ...conn, status: "disconnected" as const } : conn,
    )
    setConnections(updatedConnections)
    localStorage.setItem("connections", JSON.stringify(updatedConnections))
  }

  const sendMessage = (connectionId: string, phoneNumber: string, message: string) => {
    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      connectionId,
      phoneNumber,
      message,
      status: "pending",
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    localStorage.setItem("messages", JSON.stringify(updatedMessages))

    // Simulate message status updates
    setTimeout(() => {
      const statuses: MessageStatus[] = ["sent", "delivered", "failed"]
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]

      const finalMessages = updatedMessages.map((msg) =>
        msg.id === newMessage.id ? { ...msg, status: randomStatus } : msg,
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
      setConnections(fetchedConnections)
      localStorage.setItem("connections", JSON.stringify(fetchedConnections))
    } catch (error) {
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

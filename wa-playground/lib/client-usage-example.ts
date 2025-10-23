// Client-side usage example showing how the API key is automatically handled
"use client"

import { useApi } from '@/contexts/api-context'
import { getConnections, addNewConnection, sendMessage } from '@/services'

export function ClientUsageExample() {
  const { apiKey } = useApi()

  const handleGetConnections = async () => {
    try {
      // API key is automatically added from localStorage via axios interceptor
      const connections = await getConnections()
      console.log('Connections:', connections)
    } catch (error) {
      console.error('Failed to get connections:', error)
    }
  }

  const handleCreateConnection = async () => {
    try {
      // API key is automatically added from localStorage via axios interceptor
      const newConnection = await addNewConnection('My Device', 'iPhone 15 Pro')
      console.log('New connection:', newConnection)
    } catch (error) {
      console.error('Failed to create connection:', error)
    }
  }

  const handleSendMessage = async (connectionId: string, phoneNumber: string, message: string) => {
    try {
      // API key is automatically added from localStorage via axios interceptor
      const sentMessage = await sendMessage(connectionId, phoneNumber, message)
      console.log('Message sent:', sentMessage)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <div>
      <h2>Client Usage Example</h2>
      <p>Current API Key: {apiKey ? 'Set' : 'Not set'}</p>
      
      <button onClick={handleGetConnections}>
        Get Connections
      </button>
      
      <button onClick={handleCreateConnection}>
        Create Connection
      </button>
      
      <button onClick={() => handleSendMessage('conn-123', '+1234567890', 'Hello!')}>
        Send Message
      </button>
    </div>
  )
}

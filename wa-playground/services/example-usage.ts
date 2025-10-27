// Example usage of the services
import { 
  getConnections, 
  addNewConnection, 
  sendMessage, 
  getConnectionStatus, 
  disconnectConnection 
} from './index'

// Example: Using the services in a React component or server action
export async function exampleUsage() {
  try {
    // Get all connections (API key automatically added from localStorage)
    const connections = await getConnections()
    console.log('Connections:', connections)
    
    // Create a new connection
    const newConnection = await addNewConnection('My Device', 'iPhone 15 Pro')
    console.log('New connection:', newConnection)
    
    // Get connection status
    const connectionStatus = await getConnectionStatus(newConnection.id)
    console.log('Connection status:', connectionStatus)
    
    // Send a message
    const sentMessage = await sendMessage(
      newConnection.id, 
      '+1234567890', 
      'Hello from WhatsApp API!'
    )
    console.log('Message sent:', sentMessage)
    
    // Disconnect connection
    const disconnectResult = await disconnectConnection(newConnection.id)
    console.log('Disconnect result:', disconnectResult)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

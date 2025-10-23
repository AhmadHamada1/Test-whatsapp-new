import { addConnection } from "./addConnection";
import { disconnectConnection } from "./disconnectConnection";
import { getConnectionStatus } from "./getConnectionStatus";
import { getMessages } from "./getMessages";
import { listConnections } from "./listConnections";
import { sendMessage } from "./sendMessage";

export {
  addConnection, // Create a new WhatsApp connection
  disconnectConnection, // Disconnect a WhatsApp connection
  getConnectionStatus, // Get the status of a WhatsApp connection
  getMessages, // Get messages for a WhatsApp connection
  listConnections, // List all WhatsApp connections
  sendMessage, // Send a message using a WhatsApp connection
};
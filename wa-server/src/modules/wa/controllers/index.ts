import { addConnection } from "./addConnection";
import { disconnectConnection } from "./disconnectConnection";
import { getConnectionStatus } from "./getConnectionStatus";
import { listConnections } from "./listConnections";
import { updateConnectionStatus } from "./updateConnectionStatus";
import { sendMessage } from "./sendMessage";

export {
  addConnection, // Create a new WhatsApp connection
  disconnectConnection, // Disconnect a WhatsApp connection
  getConnectionStatus, // Get the status of a WhatsApp connection
  listConnections, // List all WhatsApp connections
  updateConnectionStatus, // Update the status of a WhatsApp connection
  sendMessage, // Send a message using a WhatsApp connection
};
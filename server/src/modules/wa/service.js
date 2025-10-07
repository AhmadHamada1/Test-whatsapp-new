"use strict";

const { Client, MessageMedia, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const { WaConnection } = require("./model");

// In-memory stores keyed by connectionId
const clientsByConnectionId = new Map();
const readyByConnectionId = new Map();
const qrResolversByConnectionId = new Map(); // connectionId -> Array<resolve>

// MongoDB store for session management
let mongoStore = null;

// Initialize MongoDB store
async function initializeMongoStore() {
  try {
    if (!mongoStore) {
      mongoStore = new MongoStore({ mongoose: mongoose });
      console.log('MongoDB store initialized for WhatsApp sessions');
    }
    return mongoStore;
  } catch (error) {
    console.error('Failed to initialize MongoDB store:', error);
    throw error;
  }
}

// Session restoration on server startup
async function restoreExistingConnections() {
  try {
    console.log('Restoring existing WhatsApp connections...');
    
    // Find all ready connections that should be restored
    const readyConnections = await WaConnection.find({ 
      status: "ready" 
    }).sort({ createdAt: -1 });
    
    console.log(`Found ${readyConnections.length} ready connections to restore`);
    
    for (const connection of readyConnections) {
      const connectionId = connection._id.toString();
      console.log(`Restoring connection ${connectionId} (${connection.phoneNumber || 'unknown'})`);
      
      try {
        // Create client with existing session
        const client = await ensureClientForConnection(connectionId);
        
        // The client will automatically restore the session if it exists
        // We'll wait a bit for the ready event to fire
        await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.log(`Connection ${connectionId} restoration timeout`);
            resolve();
          }, 10000); // 10 second timeout
          
          client.once('ready', () => {
            clearTimeout(timeout);
            console.log(`Connection ${connectionId} restored successfully`);
            resolve();
          });
          
          client.once('auth_failure', () => {
            clearTimeout(timeout);
            console.log(`Connection ${connectionId} authentication failed during restoration`);
            resolve();
          });
        });
        
      } catch (error) {
        console.error(`Failed to restore connection ${connectionId}:`, error.message);
        // Mark connection as disconnected if restoration fails
        await updateConnection(connectionId, {
          status: "disconnected",
          disconnectedAt: new Date(),
          connectionStep: "disconnected",
          error: `Restoration failed: ${error.message}`
        });
      }
    }
    
    console.log('Connection restoration completed');
  } catch (error) {
    console.error('Error during connection restoration:', error);
  }
}

function getQrResolvers(connectionId) {
  let list = qrResolversByConnectionId.get(connectionId);
  if (!list) {
    list = [];
    qrResolversByConnectionId.set(connectionId, list);
  }
  return list;
}

async function createConnection(apiKeyId) {
  const conn = new WaConnection({
    apiKey: apiKeyId,
    status: "pending",
    connectionStep: "not_started"
  });
  await conn.save();
  return conn;
}

async function updateConnection(connectionId, update) {
  const conn = await WaConnection.findByIdAndUpdate(
    connectionId,
    { $set: update },
    { new: true }
  );
  return conn;
}

// Check if a session exists for a connection
async function hasValidSession(connectionId) {
  try {
    const store = await initializeMongoStore();
    const sessionExists = await store.sessionExists(`connection_${connectionId}`);
    console.log(`Session exists for connection ${connectionId}: ${sessionExists}`);
    return sessionExists;
  } catch (error) {
    console.error(`Error checking session for connection ${connectionId}:`, error);
    return false;
  }
}

// Create a fresh client with RemoteAuth for sending messages
async function createFreshClientForSending(connectionId) {
  console.log(`Creating fresh client for sending messages - connection: ${connectionId}`);
  
  // Check if session exists first
  const sessionExists = await hasValidSession(connectionId);
  if (!sessionExists) {
    throw new Error(`No valid session found for connection ${connectionId}. Please scan the QR code first.`);
  }
  
  // Ensure MongoDB store is initialized
  const store = await initializeMongoStore();

  const client = new Client({
    authStrategy: new RemoteAuth({
      store: store,
      clientId: `connection_${connectionId}`,
      backupSyncIntervalMs: 300000 // 5 minutes
    }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  return new Promise((resolve, reject) => {
    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        reject(new Error('Client initialization timeout'));
      }
    }, 30000); // 30 second timeout

    client.once("ready", async () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        console.log(`Fresh client ready for connection=${connectionId}`);
        resolve(client);
      }
    });

    client.on("auth_failure", (msg) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`Authentication failed: ${msg}`));
      }
    });

    client.on("disconnected", (reason) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(new Error(`Client disconnected: ${reason}`));
      }
    });

    client.initialize();
  });
}

async function ensureClientForConnection(connectionId) {
  if (clientsByConnectionId.has(connectionId)) return clientsByConnectionId.get(connectionId);

  // Ensure MongoDB store is initialized
  const store = await initializeMongoStore();

  const client = new Client({
    authStrategy: new RemoteAuth({
      store: store,
      clientId: `connection_${connectionId}`,
      backupSyncIntervalMs: 300000 // 5 minutes
    }),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on("qr", async (qr) => {
    console.log(`QR code generated for connection=${connectionId}`);
    await updateConnection(connectionId, { 
      lastQr: qr, 
      lastQrAt: new Date(), 
      status: "pending",
      connectionStep: "qr_generated"
    });
    const resolvers = getQrResolvers(connectionId);
    if (resolvers.length > 0) {
      const copy = resolvers.slice();
      resolvers.length = 0;
      for (const resolve of copy) resolve(qr);
    }
  });

  client.on("authenticated", async (session) => {
    console.log(`WhatsApp authenticated for connection=${connectionId}`);
    await updateConnection(connectionId, { 
      status: "authenticated", 
      authenticatedAt: new Date(),
      connectionStep: "authenticated"
    });
  });

  client.once("ready", async () => {
    console.log(`WhatsApp client ready for connection=${connectionId}`);
    readyByConnectionId.set(connectionId, true);
    
    try {
      // Capture account information
      const accountInfo = await captureAccountInfo(client);
      
      await updateConnection(connectionId, { 
        status: "ready", 
        readyAt: new Date(),
        connectionStep: "ready",
        ...accountInfo
      });
    } catch (error) {
      console.error(`Failed to capture account info for connection=${connectionId}:`, error);
      // Still mark as ready even if account info capture fails
      await updateConnection(connectionId, { 
        status: "ready", 
        readyAt: new Date(),
        connectionStep: "ready"
      });
    }
  });

  client.on("auth_failure", async (msg) => {
    console.log(`WhatsApp authentication failed for connection=${connectionId}:`, msg);
    await updateConnection(connectionId, { 
      status: "auth_failed", 
      authFailedAt: new Date(),
      connectionStep: "auth_failed",
      error: msg
    });
  });

  client.on("disconnected", async (reason) => {
    console.log(`WhatsApp disconnected for connection=${connectionId}:`, reason);
    readyByConnectionId.set(connectionId, false);
    await updateConnection(connectionId, { 
      status: "disconnected", 
      disconnectedAt: new Date(),
      connectionStep: "disconnected",
      disconnectReason: reason
    });
  });

  // Handle page crashes and other errors
  client.on("change_state", (state) => {
    console.log(`WhatsApp client state changed for connection=${connectionId}:`, state);
    if (state === 'UNPAIRED' || state === 'UNPAIRED_IDLE') {
      readyByConnectionId.set(connectionId, false);
    }
  });

  // Listen for when session is saved to MongoDB
  client.on('remote_session_saved', () => {
    console.log(`Session saved to MongoDB for connection=${connectionId}`);
  });

  client.initialize();
  clientsByConnectionId.set(connectionId, client);
  readyByConnectionId.set(connectionId, false);
  return client;
}

function waitForNextQr(connectionId) {
  return new Promise((resolve) => {
    getQrResolvers(connectionId).push(resolve);
  });
}

function normalizeRecipient(recipient) {
  let cleaned = String(recipient).trim();
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (!cleaned.endsWith("@c.us")) cleaned = `${cleaned}@c.us`;
  return cleaned;
}

async function captureAccountInfo(client) {
  const accountInfo = {};
  
  try {
    // Get basic user information from client.info
    if (!client.info) {
      throw new Error('Client info not available');
    }
    
    accountInfo.phoneNumber = client.info.wid.user;
    accountInfo.whatsappId = client.info.wid._serialized;
    accountInfo.profileName = client.info.pushname;
    
    // Get platform information
    if (client.info.platform) {
      accountInfo.platform = client.info.platform;
    }
    
    // Get profile picture URL
    try {
      const profilePicUrl = await client.getProfilePicUrl(client.info.wid._serialized);
      accountInfo.profilePictureUrl = profilePicUrl;
    } catch (error) {
      console.log(`Profile picture not available or private for ${client.info.wid.user}:`, error.message);
    }
    
    // Get status message
    try {
      const status = await client.getStatus(client.info.wid._serialized);
      accountInfo.statusMessage = status.status;
    } catch (error) {
      console.log(`Status message not available or private for ${client.info.wid.user}:`, error.message);
    }
    
    // Set lastSeen to current time when connection is established
    accountInfo.lastSeen = new Date();
    
    console.log(`Account info captured for ${client.info.wid.user}:`, {
      phoneNumber: accountInfo.phoneNumber,
      profileName: accountInfo.profileName,
      platform: accountInfo.platform,
      hasProfilePicture: !!accountInfo.profilePictureUrl,
      hasStatusMessage: !!accountInfo.statusMessage,
      lastSeen: accountInfo.lastSeen
    });
    
  } catch (error) {
    console.error('Error capturing account info:', error);
    throw error;
  }
  
  return accountInfo;
}

async function addNumber(apiKeyId) {
  // Create a new connection
  const connection = await createConnection(apiKeyId);
  const connectionId = connection._id.toString();
  
  // Check if there's already a ready connection for this API key
  const existingReadyConnection = await WaConnection.findOne({ 
    apiKey: apiKeyId, 
    status: "ready" 
  });
  
  if (existingReadyConnection) {
    return { 
      alreadyConnected: true,
      connectionId: existingReadyConnection._id.toString(),
      accountInfo: {
        phoneNumber: existingReadyConnection.phoneNumber,
        whatsappId: existingReadyConnection.whatsappId,
        profileName: existingReadyConnection.profileName,
        platform: existingReadyConnection.platform,
        profilePictureUrl: existingReadyConnection.profilePictureUrl,
        statusMessage: existingReadyConnection.statusMessage
      }
    };
  }
  
  // Start the client for this connection
  const client = await ensureClientForConnection(connectionId);
  const qr = await waitForNextQr(connectionId);
  
  // Generate QR code image
  const qrImageBuffer = await QRCode.toBuffer(qr, {
    type: 'png',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
  
  // Convert buffer to base64 data URL
  const qrImageDataUrl = `data:image/png;base64,${qrImageBuffer.toString('base64')}`;
  
  return { 
    connectionId: connectionId,
    qr, 
    qrImage: qrImageDataUrl 
  };
}

function assertConnectionReady(connectionId) {
  if (!clientsByConnectionId.has(connectionId)) {
    const err = new Error("WhatsApp connection is not initialized yet. Please scan the QR code first.");
    err.status = 400;
    throw err;
  }
  
  // For authenticated connections, we don't need to wait for the ready event
  // The client should be able to send messages once authenticated
  const isReady = readyByConnectionId.get(connectionId);
  if (!isReady) {
    console.log(`Connection ${connectionId} is authenticated but not yet marked as ready. Attempting to send message anyway.`);
  }
  
  // Additional check: ensure the client is actually available and properly initialized
  const client = clientsByConnectionId.get(connectionId);
  if (!client) {
    const err = new Error("WhatsApp client is not available. Please try again.");
    err.status = 500;
    throw err;
  }
  
  // Check if the client's page object is available (indicates proper initialization)
  if (!client.pupPage) {
    const err = new Error("WhatsApp client is not properly initialized. The browser session may have crashed. Please try reconnecting your number.");
    err.status = 500;
    throw err;
  }
}

async function getClientForConnection(apiKeyId, connectionId) {
  console.log(`Getting client for connection ${connectionId} with API key ${apiKeyId}`);
  
  // Find the specific connection by ID
  const connection = await WaConnection.findOne({ 
    _id: connectionId, 
    apiKey: apiKeyId 
  });
  
  if (!connection) {
    const err = new Error("Connection not found or not associated with this API key");
    err.status = 404;
    throw err;
  }
  
  console.log(`Connection found with status: ${connection.status}`);

  if (!['ready', 'authenticated'].includes(connection.status)) {
    let errorMessage = "Connection is not ready. Status: " + connection.status;
    if (connection.status === 'pending') {
      errorMessage += ". Please scan the QR code first.";
    } else if (connection.status === 'auth_failed') {
      errorMessage += ". Authentication failed. Please try scanning the QR code again.";
    } else if (connection.status === 'disconnected') {
      errorMessage += ". Connection was disconnected. Please add a new number.";
    }
    const err = new Error(errorMessage);
    err.status = 400;
    throw err;
  }

  // Ensure the client is initialized for this connection
  if (!clientsByConnectionId.has(connectionId)) {
    console.log(`Client not found for connection ${connectionId}, initializing...`);
    await ensureClientForConnection(connectionId);
    console.log(`Client initialized for connection ${connectionId}`);
  } else {
    console.log(`Client already exists for connection ${connectionId}`);
    
    // Check if the existing client is in a valid state
    const existingClient = clientsByConnectionId.get(connectionId);
    if (!existingClient || !existingClient.pupPage) {
      console.log(`Existing client for connection ${connectionId} is invalid, reinitializing...`);
      // Remove the invalid client
      clientsByConnectionId.delete(connectionId);
      readyByConnectionId.delete(connectionId);
      // Reinitialize
      await ensureClientForConnection(connectionId);
      console.log(`Client reinitialized for connection ${connectionId}`);
    }
  }
  
  // Get the client for this specific connection
  assertConnectionReady(connectionId);
  return clientsByConnectionId.get(connectionId);
}

async function listConnections(apiKeyId) {
  const connections = await WaConnection.find({ apiKey: apiKeyId })
    .select('status lastQrAt readyAt disconnectedAt createdAt phoneNumber whatsappId profileName platform profilePictureUrl statusMessage lastSeen')
    .sort({ createdAt: -1 });
  
  return connections.map(conn => ({
    id: conn._id,
    status: conn.status,
    lastQrAt: conn.lastQrAt,
    readyAt: conn.readyAt,
    disconnectedAt: conn.disconnectedAt,
    createdAt: conn.createdAt,
    accountInfo: {
      phoneNumber: conn.phoneNumber,
      whatsappId: conn.whatsappId,
      profileName: conn.profileName,
      platform: conn.platform,
      profilePictureUrl: conn.profilePictureUrl,
      statusMessage: conn.statusMessage,
      lastSeen: conn.lastSeen
    }
  }));
}

// Send message with session recreation if needed
async function sendMessageWithSessionRecreation(apiKeyId, to, messageContent, connectionId, isMedia = false) {
  console.log(`Attempting to send ${isMedia ? 'media' : 'text'} message to ${to} using connection ${connectionId}`);
  
  // First, try with existing client
  try {
    const client = await getClientForConnection(apiKeyId, connectionId);
    
    if (client && client.pupPage) {
      console.log(`Using existing client for connection ${connectionId}`);
      const chatId = normalizeRecipient(to);
      
      if (isMedia) {
        const { mimetype, filename, dataBase64 } = messageContent;
        const media = new MessageMedia(mimetype, dataBase64, filename);
        const result = await client.sendMessage(chatId, media);
        return { id: result.id.id, timestamp: result.timestamp };
      } else {
        const result = await client.sendMessage(chatId, messageContent);
        return { id: result.id.id, timestamp: result.timestamp };
      }
    }
  } catch (error) {
    console.log(`Existing client failed for connection ${connectionId}:`, error.message);
    
    // If it's an evaluate error or client issue, try with fresh client
    if (error.message && (error.message.includes('evaluate') || error.message.includes('not properly initialized'))) {
      console.log(`Creating fresh client for connection ${connectionId} due to client error`);
      
      try {
        const freshClient = await createFreshClientForSending(connectionId);
        const chatId = normalizeRecipient(to);
        
        if (isMedia) {
          const { mimetype, filename, dataBase64 } = messageContent;
          const media = new MessageMedia(mimetype, dataBase64, filename);
          const result = await freshClient.sendMessage(chatId, media);
          
          // Clean up the fresh client after use
          setTimeout(() => {
            try {
              freshClient.destroy();
            } catch (e) {
              console.log('Error destroying fresh client:', e.message);
            }
          }, 5000);
          
          return { id: result.id.id, timestamp: result.timestamp };
        } else {
          const result = await freshClient.sendMessage(chatId, messageContent);
          
          // Clean up the fresh client after use
          setTimeout(() => {
            try {
              freshClient.destroy();
            } catch (e) {
              console.log('Error destroying fresh client:', e.message);
            }
          }, 5000);
          
          return { id: result.id.id, timestamp: result.timestamp };
        }
      } catch (freshError) {
        console.error(`Fresh client also failed for connection ${connectionId}:`, freshError);
        throw new Error(`Failed to send message: ${freshError.message}`);
      }
    }
    
    throw error;
  }
}

async function sendTextMessage(apiKeyId, to, text, connectionId) {
  return await sendMessageWithSessionRecreation(apiKeyId, to, text, connectionId, false);
}

async function sendMediaMessage(apiKeyId, to, mediaInput, connectionId) {
  return await sendMessageWithSessionRecreation(apiKeyId, to, mediaInput, connectionId, true);
}

async function getConnectionStatus(apiKeyId, connectionId = null) {
  try {
    let connection;
    
    if (connectionId) {
      // Get specific connection
      connection = await WaConnection.findOne({ 
        _id: connectionId, 
        apiKey: apiKeyId 
      });
      
      if (!connection) {
        const err = new Error("Connection not found or not associated with this API key");
        err.status = 404;
        throw err;
      }
    } else {
      // Get the most recent connection
      connection = await WaConnection.findOne({ apiKey: apiKeyId })
        .sort({ createdAt: -1 });
      
      if (!connection) {
        return {
          status: "not_started",
          message: "No connection attempt found. Call /wa/add-number first.",
          connectionStep: "not_started"
        };
      }
    }

    const isReady = readyByConnectionId.get(connection._id.toString()) || false;
    
    return {
      connectionId: connection._id.toString(),
      status: connection.status,
      connectionStep: connection.connectionStep || "unknown",
      isReady,
      lastQrAt: connection.lastQrAt,
      authenticatedAt: connection.authenticatedAt,
      readyAt: connection.readyAt,
      authFailedAt: connection.authFailedAt,
      disconnectedAt: connection.disconnectedAt,
      error: connection.error,
      disconnectReason: connection.disconnectReason,
      message: getStatusMessage(connection.status, connection.connectionStep),
      accountInfo: {
        phoneNumber: connection.phoneNumber,
        whatsappId: connection.whatsappId,
        profileName: connection.profileName,
        platform: connection.platform,
        profilePictureUrl: connection.profilePictureUrl,
        statusMessage: connection.statusMessage,
        lastSeen: connection.lastSeen
      }
    };
  } catch (error) {
    if (error.status) {
      throw error;
    }
    const err = new Error("Failed to get connection status: " + error.message);
    err.status = 500;
    throw err;
  }
}

function getStatusMessage(status, connectionStep) {
  switch (status) {
    case "pending":
      if (connectionStep === "qr_generated") {
        return "QR code generated. Please scan it with your WhatsApp mobile app.";
      }
      return "Connection in progress...";
    case "authenticated":
      return "WhatsApp authenticated successfully. Finalizing connection...";
    case "ready":
      return "WhatsApp is connected and ready to send messages!";
    case "auth_failed":
      return "Authentication failed. Please try scanning the QR code again.";
    case "disconnected":
      return "WhatsApp connection was disconnected.";
    default:
      return "Unknown connection status.";
  }
}

async function disconnectNumber(apiKeyId, connectionId = null) {
  try {
    let connection;
    
    if (connectionId) {
      // Disconnect specific connection
      connection = await WaConnection.findOne({ 
        _id: connectionId,
        apiKey: apiKeyId,
        status: { $in: ["ready", "pending"] }
      });

      if (!connection) {
        const err = new Error("Connection not found or not active for this API key");
        err.status = 404;
        throw err;
      }
    } else {
      // Disconnect the most recent active connection
      connection = await WaConnection.findOne({ 
        apiKey: apiKeyId,
        status: { $in: ["ready", "pending"] }
      }).sort({ createdAt: -1 });

      if (!connection) {
        const err = new Error("No active connection found for this API key");
        err.status = 404;
        throw err;
      }
    }

    const connectionIdStr = connection._id.toString();

    // Get the client and disconnect it
    if (clientsByConnectionId.has(connectionIdStr)) {
      const client = clientsByConnectionId.get(connectionIdStr);
      
      // Destroy the client
      await client.destroy();
      
      // Remove from memory stores
      clientsByConnectionId.delete(connectionIdStr);
      readyByConnectionId.delete(connectionIdStr);
      qrResolversByConnectionId.delete(connectionIdStr);
    }

    // Update connection status in database
    await WaConnection.findByIdAndUpdate(connectionIdStr, { 
      status: "disconnected",
      disconnectedAt: new Date(),
      connectionStep: "disconnected"
    });

    return { 
      success: true, 
      message: "WhatsApp connection disconnected successfully",
      connectionId: connectionIdStr,
      disconnectedAt: new Date()
    };
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error.status) {
      throw error;
    }
    
    // For other errors, wrap them
    const err = new Error("Failed to disconnect WhatsApp: " + error.message);
    err.status = 500;
    throw err;
  }
}

async function getConnectionStatusById(apiKeyId, connectionId) {
  return await getConnectionStatus(apiKeyId, connectionId);
}

// Clean up MongoDB sessions for disconnected connections
async function cleanupDisconnectedSessions() {
  try {
    console.log('Cleaning up disconnected MongoDB sessions...');
    
    // Initialize MongoDB store if not already done
    const store = await initializeMongoStore();
    
    // Find all disconnected connections
    const disconnectedConnections = await WaConnection.find({ 
      status: "disconnected" 
    });
    
    for (const connection of disconnectedConnections) {
      const connectionId = connection._id.toString();
      const sessionName = `connection_${connectionId}`;
      
      try {
        // Check if session exists in MongoDB
        const sessionExists = await store.sessionExists({ session: sessionName });
        
        if (sessionExists) {
          // Delete the session from MongoDB
          await store.delete({ session: sessionName });
          console.log(`Cleaned up MongoDB session for connection ${connectionId}`);
        }
      } catch (error) {
        console.error(`Failed to clean up MongoDB session for connection ${connectionId}:`, error.message);
      }
    }
    
    console.log('MongoDB session cleanup completed');
  } catch (error) {
    console.error('Error during MongoDB session cleanup:', error);
  }
}

module.exports = {
  addNumber,
  listConnections,
  sendTextMessage,
  sendMediaMessage,
  disconnectNumber,
  getConnectionStatus,
  getConnectionStatusById,
  restoreExistingConnections,
  cleanupDisconnectedSessions,
};



"use strict";

const { Client, MessageMedia } = require("whatsapp-web.js");
const { WaConnection } = require("./model");

// In-memory stores keyed by apiKeyId
const clientsByApiKey = new Map();
const readyByApiKey = new Map();
const qrResolversByApiKey = new Map(); // apiKeyId -> Array<resolve>

function getQrResolvers(apiKeyId) {
  let list = qrResolversByApiKey.get(apiKeyId);
  if (!list) {
    list = [];
    qrResolversByApiKey.set(apiKeyId, list);
  }
  return list;
}

async function upsertConnection(apiKeyId, update) {
  const conn = await WaConnection.findOneAndUpdate(
    { apiKey: apiKeyId },
    { $setOnInsert: { apiKey: apiKeyId }, $set: update },
    { new: true, upsert: true }
  );
  return conn;
}

function ensureClientForApiKey(apiKeyId) {
  if (clientsByApiKey.has(apiKeyId)) return clientsByApiKey.get(apiKeyId);

  const client = new Client();

  client.on("qr", async (qr) => {
    await upsertConnection(apiKeyId, { lastQr: qr, lastQrAt: new Date(), status: "pending" });
    const resolvers = getQrResolvers(apiKeyId);
    if (resolvers.length > 0) {
      const copy = resolvers.slice();
      resolvers.length = 0;
      for (const resolve of copy) resolve(qr);
    }
  });

  client.once("ready", async () => {
    readyByApiKey.set(apiKeyId, true);
    await upsertConnection(apiKeyId, { status: "ready", readyAt: new Date() });
    // eslint-disable-next-line no-console
    console.log(`WhatsApp client ready for apiKey=${apiKeyId}`);
  });

  client.on("disconnected", async () => {
    readyByApiKey.set(apiKeyId, false);
    await upsertConnection(apiKeyId, { status: "disconnected", disconnectedAt: new Date() });
  });

  client.initialize();
  clientsByApiKey.set(apiKeyId, client);
  readyByApiKey.set(apiKeyId, false);
  return client;
}

function waitForNextQr(apiKeyId) {
  return new Promise((resolve) => {
    getQrResolvers(apiKeyId).push(resolve);
  });
}

function normalizeRecipient(recipient) {
  let cleaned = String(recipient).trim();
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (!cleaned.endsWith("@c.us")) cleaned = `${cleaned}@c.us`;
  return cleaned;
}

async function addNumber(apiKeyId) {
  const client = ensureClientForApiKey(apiKeyId);
  if (readyByApiKey.get(apiKeyId)) {
    await upsertConnection(apiKeyId, { status: "ready" });
    return { alreadyConnected: true };
  }
  const qr = await waitForNextQr(apiKeyId);
  return { qr };
}

function assertReady(apiKeyId) {
  if (!clientsByApiKey.has(apiKeyId) || !readyByApiKey.get(apiKeyId)) {
    const err = new Error("WhatsApp client is not connected yet. Add a number first.");
    err.status = 400;
    throw err;
  }
}

async function getClientForConnection(apiKeyId, connectionCode) {
  if (!connectionCode) {
    // If no connection code provided, use the default behavior
    assertReady(apiKeyId);
    return clientsByApiKey.get(apiKeyId);
  }

  // Find the specific connection by ID
  const connection = await WaConnection.findOne({ 
    _id: connectionCode, 
    apiKey: apiKeyId 
  });
  
  if (!connection) {
    const err = new Error("Connection not found or not associated with this API key");
    err.status = 404;
    throw err;
  }

  if (connection.status !== 'ready') {
    const err = new Error("Connection is not ready. Status: " + connection.status);
    err.status = 400;
    throw err;
  }

  // For now, we'll use the same client mapping logic
  // In a more complex system, you might want to store client references per connection
  assertReady(apiKeyId);
  return clientsByApiKey.get(apiKeyId);
}

async function listConnections(apiKeyId) {
  const connections = await WaConnection.find({ apiKey: apiKeyId })
    .select('status lastQrAt readyAt disconnectedAt createdAt')
    .sort({ createdAt: -1 });
  
  return connections.map(conn => ({
    id: conn._id,
    status: conn.status,
    lastQrAt: conn.lastQrAt,
    readyAt: conn.readyAt,
    disconnectedAt: conn.disconnectedAt,
    createdAt: conn.createdAt
  }));
}

async function sendTextMessage(apiKeyId, to, text, connectionCode) {
  const client = getClientForConnection(apiKeyId, connectionCode);
  const chatId = normalizeRecipient(to);
  const result = await client.sendMessage(chatId, text);
  return { id: result.id.id, timestamp: result.timestamp };
}

async function sendMediaMessage(apiKeyId, to, mediaInput, connectionCode) {
  const client = getClientForConnection(apiKeyId, connectionCode);
  const { mimetype, filename, dataBase64 } = mediaInput;
  const chatId = normalizeRecipient(to);
  const media = new MessageMedia(mimetype, dataBase64, filename);
  const result = await client.sendMessage(chatId, media);
  return { id: result.id.id, timestamp: result.timestamp };
}

async function disconnectNumber(apiKeyId) {
  try {
    // Check if there's an active connection
    const connection = await WaConnection.findOne({ 
      apiKey: apiKeyId,
      status: { $in: ["ready", "pending"] }
    });

    if (!connection) {
      const err = new Error("No active connection found for this API key");
      err.status = 404;
      throw err;
    }

    // Get the client and disconnect it
    if (clientsByApiKey.has(apiKeyId)) {
      const client = clientsByApiKey.get(apiKeyId);
      
      // Destroy the client
      await client.destroy();
      
      // Remove from memory stores
      clientsByApiKey.delete(apiKeyId);
      readyByApiKey.delete(apiKeyId);
      qrResolversByApiKey.delete(apiKeyId);
    }

    // Update connection status in database
    await WaConnection.findOneAndUpdate(
      { apiKey: apiKeyId, status: { $in: ["ready", "pending"] } },
      { 
        status: "disconnected",
        disconnectedAt: new Date()
      }
    );

    return { 
      success: true, 
      message: "WhatsApp connection disconnected successfully",
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

module.exports = {
  addNumber,
  listConnections,
  sendTextMessage,
  sendMediaMessage,
  disconnectNumber,
};



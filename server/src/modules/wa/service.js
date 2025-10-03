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

async function sendTextMessage(apiKeyId, to, text) {
  assertReady(apiKeyId);
  const client = clientsByApiKey.get(apiKeyId);
  const chatId = normalizeRecipient(to);
  const result = await client.sendMessage(chatId, text);
  return { id: result.id.id, timestamp: result.timestamp };
}

async function sendMediaMessage(apiKeyId, to, mediaInput) {
  assertReady(apiKeyId);
  const client = clientsByApiKey.get(apiKeyId);
  const { mimetype, filename, dataBase64 } = mediaInput;
  const chatId = normalizeRecipient(to);
  const media = new MessageMedia(mimetype, dataBase64, filename);
  const result = await client.sendMessage(chatId, media);
  return { id: result.id.id, timestamp: result.timestamp };
}

module.exports = {
  addNumber,
  sendTextMessage,
  sendMediaMessage,
};



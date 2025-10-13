"use strict";

const { addNumber, sendTextMessage, sendMediaMessage, listConnections, disconnectNumber, getConnectionStatus, getConnectionStatusById } = require("./service");

async function addNumberHandler(req, res, next) {
  try {
    const result = await addNumber(req.apiKey._id);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function listConnectionsHandler(req, res, next) {
  try {
    const result = await listConnections(req.apiKey._id);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function listConnectionsAdminHandler(req, res, next) {
  try {
    const apiKeyId = req.params.apiKeyId;
    const result = await listConnections(apiKeyId);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function disconnectHandler(req, res, next) {
  try {
    const { connectionId } = req.params;
    const result = await disconnectNumber(req.apiKey._id, connectionId);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function sendHandler(req, res, next) {
  try {
    const { to, text, media, connectionId } = req.body;
    const result = text
      ? await sendTextMessage(req.apiKey._id, to, text, connectionId)
      : await sendMediaMessage(req.apiKey._id, to, media, connectionId);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getConnectionStatusHandler(req, res, next) {
  try {
    const { connectionId } = req.params;
    const result = connectionId 
      ? await getConnectionStatusById(req.apiKey._id, connectionId)
      : await getConnectionStatus(req.apiKey._id);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { addNumberHandler, listConnectionsHandler, listConnectionsAdminHandler, disconnectHandler, sendHandler, getConnectionStatusHandler };

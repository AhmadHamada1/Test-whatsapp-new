"use strict";

const { addNumber, sendTextMessage, sendMediaMessage, listConnections, disconnectNumber } = require("./service");

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
    const result = await disconnectNumber(req.apiKey._id);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function sendHandler(req, res, next) {
  try {
    const { to, text, media, connectionCode } = req.body;
    const result = text
      ? await sendTextMessage(req.apiKey._id, to, text, connectionCode)
      : await sendMediaMessage(req.apiKey._id, to, media, connectionCode);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { addNumberHandler, listConnectionsHandler, listConnectionsAdminHandler, disconnectHandler, sendHandler };



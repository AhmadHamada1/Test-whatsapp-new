"use strict";

const { listConnections } = require("./service");

async function listConnectionsAdminHandler(req, res, next) {
  try {
    const apiKeyId = req.params.apiKeyId;
    const result = await listConnections(apiKeyId);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { listConnectionsAdminHandler };
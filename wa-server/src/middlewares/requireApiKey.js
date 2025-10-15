"use strict";

const { sha256 } = require("../utils/crypto");
const { ApiKey } = require("../modules/api-key/model");

async function requireApiKey(req, res, next) {
  try {
    const headerKey = req.header("x-api-key");
    if (!headerKey) return next({ status: 401, message: "Missing API key" });

    const tokenHash = sha256(headerKey);
    const apiKey = await ApiKey.findOne({ tokenHash, status: "active" });
    if (!apiKey) return next({ status: 401, message: "Invalid or inactive API key" });

    apiKey.usageCount = (apiKey.usageCount || 0) + 1;
    apiKey.lastUsedAt = new Date();
    await apiKey.save();
    req.apiKey = apiKey;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireApiKey };
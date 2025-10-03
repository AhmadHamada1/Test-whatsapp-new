"use strict";

const { ApiKey } = require("./model");
const { generateToken, sha256 } = require("../../core/utils/crypto");

async function createKey(label, adminId) {
  const token = generateToken(32);
  const tokenHash = sha256(token);
  const tokenPrefix = token.slice(0, 6);
  const apiKey = await ApiKey.create({ label, tokenHash, tokenPrefix, createdBy: adminId });
  return { token, apiKey };
}

async function listKeys() {
  return ApiKey.find().sort({ createdAt: -1 });
}

async function getKey(id) {
  const key = await ApiKey.findById(id);
  if (!key) throw Object.assign(new Error("API key not found"), { status: 404 });
  return key;
}

async function revokeKey(id) {
  const key = await getKey(id);
  if (key.status !== "revoked") {
    key.status = "revoked";
    key.revokedAt = new Date();
    await key.save();
  }
  return key;
}

async function activateKey(id) {
  const key = await getKey(id);
  if (key.status !== "active") {
    key.status = "active";
    key.revokedAt = undefined;
    await key.save();
  }
  return key;
}

async function deleteKey(id) {
  const key = await getKey(id);
  await key.deleteOne();
  return { ok: true };
}

module.exports = { createKey, listKeys, getKey, revokeKey, activateKey, deleteKey };



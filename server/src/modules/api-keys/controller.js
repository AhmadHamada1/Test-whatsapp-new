"use strict";

const { createKey, listKeys, getKey, revokeKey, activateKey } = require("./service");

async function create(req, res, next) {
  try {
    const { label } = req.body;
    const { token, apiKey } = await createKey(label, req.admin._id);
    res.status(201).json({ token, key: apiKey });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const keys = await listKeys();
    res.json({ keys });
  } catch (err) {
    next(err);
  }
}

async function details(req, res, next) {
  try {
    const key = await getKey(req.params.id);
    res.json({ key });
  } catch (err) {
    next(err);
  }
}

async function revoke(req, res, next) {
  try {
    const key = await revokeKey(req.params.id);
    res.json({ key });
  } catch (err) {
    next(err);
  }
}

async function activate(req, res, next) {
  try {
    const key = await activateKey(req.params.id);
    res.json({ key });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, details, revoke, activate };



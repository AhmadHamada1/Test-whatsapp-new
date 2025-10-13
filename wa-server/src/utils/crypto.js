"use strict";

const crypto = require("crypto");

function generateToken(byteLength = 32) {
  return crypto.randomBytes(byteLength).toString("hex");
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

module.exports = { generateToken, sha256 };
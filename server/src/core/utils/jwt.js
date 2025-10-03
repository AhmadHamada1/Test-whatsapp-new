"use strict";

const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../../config/env");

function signJwt(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options });
}

function verifyJwt(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { signJwt, verifyJwt };



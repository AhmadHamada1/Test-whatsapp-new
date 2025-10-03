"use strict";

const session = require("express-session");
const MongoStore = require("connect-mongo");
const { NODE_ENV, SESSION_SECRET, MONGODB_URI } = require("./env");

function createSessionMiddleware() {
  const isProd = NODE_ENV === "production";

  const cookie = {
    httpOnly: true,
    sameSite: "strict",
    secure: isProd,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  };

  let store;
  if (MONGODB_URI) {
    store = MongoStore.create({ mongoUrl: MONGODB_URI, ttl: 60 * 60 * 24 * 7 });
  } else {
    console.warn("Using MemoryStore for sessions (not recommended for production)");
  }

  return session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie,
    store,
  });
}

module.exports = { createSessionMiddleware };



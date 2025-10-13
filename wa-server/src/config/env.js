"use strict";

function parseNumber(value, defaultValue) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseNumber(process.env.PORT, 4001),
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "change-me-jwt",
  MAIN_SERVER_URL: process.env.MAIN_SERVER_URL || "http://localhost:4000",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
};

module.exports = config;
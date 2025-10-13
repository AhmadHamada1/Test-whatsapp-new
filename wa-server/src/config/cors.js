"use strict";

const cors = require("cors");
const config = require("./env");

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      config.CORS_ORIGIN,
      config.MAIN_SERVER_URL,
      "http://localhost:3000",
      "http://localhost:4000"
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
};

module.exports = cors(corsOptions);

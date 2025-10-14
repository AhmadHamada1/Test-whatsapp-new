"use strict";

const cors = require("cors");
const config = require("./env");

const corsOptions = {
  origin: "*",
  credentials: false, // Must be false when origin is "*"
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"]
};

module.exports = cors(corsOptions);

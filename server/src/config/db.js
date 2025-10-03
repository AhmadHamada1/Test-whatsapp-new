"use strict";

const mongoose = require("mongoose");

async function connectToDatabase(mongoUri) {
  if (!mongoUri) {
    console.warn("MONGODB_URI not set; skipping database connection");
    return;
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
}

module.exports = { connectToDatabase };



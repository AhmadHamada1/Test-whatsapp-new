"use strict";

const mongoose = require("mongoose");

const WaConnectionSchema = new mongoose.Schema(
  {
    apiKey: { type: mongoose.Schema.Types.ObjectId, ref: "ApiKey", required: true },
    status: { type: String, enum: ["pending", "ready", "disconnected"], default: "pending", index: true },
    lastQr: { type: String },
    lastQrAt: { type: Date },
    readyAt: { type: Date },
    disconnectedAt: { type: Date },
  },
  { timestamps: true }
);

WaConnectionSchema.index({ apiKey: 1 }, { unique: true });

const WaConnection = mongoose.models.WaConnection || mongoose.model("WaConnection", WaConnectionSchema);

module.exports = { WaConnection };



"use strict";

const mongoose = require("mongoose");

const WaConnectionSchema = new mongoose.Schema(
  {
    apiKey: { type: mongoose.Schema.Types.ObjectId, ref: "ApiKey", required: true },
    status: { type: String, enum: ["pending", "authenticated", "ready", "auth_failed", "disconnected"], default: "pending", index: true },
    
    // QR Code related fields
    lastQr: { type: String },
    lastQrAt: { type: Date },
    
    // Connection timeline
    authenticatedAt: { type: Date },
    readyAt: { type: Date },
    authFailedAt: { type: Date },
    disconnectedAt: { type: Date },
    
    // Connection metadata
    connectionStep: { type: String, enum: ["not_started", "qr_generated", "authenticated", "ready", "auth_failed", "disconnected"] },
    error: { type: String },
    disconnectReason: { type: String },
    
    // WhatsApp Account Information
    phoneNumber: { type: String },
    whatsappId: { type: String },
    profileName: { type: String },
    platform: { type: String },
    profilePictureUrl: { type: String },
    statusMessage: { type: String },
    lastSeen: { type: Date },
  },
  { timestamps: true }
);

// Allow multiple connections per API key
WaConnectionSchema.index({ apiKey: 1 });
WaConnectionSchema.index({ apiKey: 1, status: 1 });

const WaConnection = mongoose.models.WaConnection || mongoose.model("WaConnection", WaConnectionSchema);

module.exports = { WaConnection };

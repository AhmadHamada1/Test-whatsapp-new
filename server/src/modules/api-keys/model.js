"use strict";

const mongoose = require("mongoose");

const ApiKeySchema = new mongoose.Schema(
  {
    label: { type: String },
    tokenHash: { type: String, required: true, unique: true, index: true },
    tokenPrefix: { type: String },
    status: { type: String, enum: ["active", "revoked"], default: "active", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

const ApiKey = mongoose.models.ApiKey || mongoose.model("ApiKey", ApiKeySchema);

module.exports = { ApiKey };



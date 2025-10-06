"use strict";

const mongoose = require("mongoose");

const ApiCallLogSchema = new mongoose.Schema(
  {
    apiKey: { type: mongoose.Schema.Types.ObjectId, ref: "ApiKey", required: true, index: true },
    endpoint: { type: String, required: true, index: true },
    method: { type: String, required: true, enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
    requestBody: { type: mongoose.Schema.Types.Mixed },
    responseStatus: { type: Number, required: true, index: true },
    responseBody: { type: mongoose.Schema.Types.Mixed },
    responseTime: { type: Number }, // in milliseconds
    userAgent: { type: String },
    ipAddress: { type: String },
    error: { type: String }, // error message if any
  },
  { timestamps: true }
);

// Index for efficient querying
ApiCallLogSchema.index({ apiKey: 1, createdAt: -1 });
ApiCallLogSchema.index({ endpoint: 1, createdAt: -1 });
ApiCallLogSchema.index({ responseStatus: 1, createdAt: -1 });

const ApiCallLog = mongoose.models.ApiCallLog || mongoose.model("ApiCallLog", ApiCallLogSchema);

module.exports = { ApiCallLog };

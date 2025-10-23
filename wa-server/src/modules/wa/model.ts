import mongoose, { Schema, Document, Model } from "mongoose";
import { ConnectionStatus } from "../../types";

export interface IConnection extends Document {
  apiKeyId: mongoose.Schema.Types.ObjectId;
  status: ConnectionStatus;
  qrCode?: string;
  name?: string;
  deviceInfo?: {
    deviceName?: string;
    browserName?: string;
    osName?: string;
  };
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionSchema = new Schema<IConnection>(
  {
    apiKeyId: { 
      type: Schema.Types.ObjectId, 
      ref: "ApiKey", 
      required: true, 
      index: true 
    },
    status: { 
      type: String, 
      enum: ["requesting_qr", "waiting_connection", "connected", "disconnected", "error"], 
      default: "requesting_qr", 
      index: true 
    },
    qrCode: { type: String },
    name: { type: String },
    deviceInfo: {
      deviceName: { type: String },
      browserName: { type: String },
      osName: { type: String }
    },
    lastActivity: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for efficient queries by apiKeyId and status
ConnectionSchema.index({ apiKeyId: 1, status: 1 });
ConnectionSchema.index({ apiKeyId: 1, createdAt: -1 });

export const Connection: Model<IConnection> = mongoose.models.Connection || mongoose.model<IConnection>("Connection", ConnectionSchema);

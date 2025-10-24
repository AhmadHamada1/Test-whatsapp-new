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
  clientInfo?: {
    phoneNumber?: string;
    platform?: string;
    phoneDetails?: {
      manufacturer?: string;
      model?: string;
      osVersion?: string;
      appVersion?: string;
    };
    whatsappInfo?: {
      profileName?: string;
      profilePicture?: string;
      isBusiness?: boolean;
      isVerified?: boolean;
    };
    connectionDetails?: {
      ipAddress?: string;
      userAgent?: string;
      connectedAt?: Date;
      lastSeen?: Date;
    };
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
      enum: ["ready", "needs_restore", "disconnected", "expired"], 
      default: "needs_restore", 
      index: true 
    },
    qrCode: { type: String },
    name: { type: String },
    deviceInfo: {
      deviceName: { type: String },
      browserName: { type: String },
      osName: { type: String }
    },
    clientInfo: {
      phoneNumber: { type: String },
      platform: { type: String },
      phoneDetails: {
        manufacturer: { type: String },
        model: { type: String },
        osVersion: { type: String },
        appVersion: { type: String }
      },
      whatsappInfo: {
        profileName: { type: String },
        profilePicture: { type: String },
        isBusiness: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false }
      },
      connectionDetails: {
        ipAddress: { type: String },
        userAgent: { type: String },
        connectedAt: { type: Date },
        lastSeen: { type: Date }
      }
    },
    lastActivity: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for efficient queries by apiKeyId and status
ConnectionSchema.index({ apiKeyId: 1, status: 1 });
ConnectionSchema.index({ apiKeyId: 1, createdAt: -1 });

export const Connection: Model<IConnection> = mongoose.models.Connection || mongoose.model<IConnection>("Connection", ConnectionSchema);

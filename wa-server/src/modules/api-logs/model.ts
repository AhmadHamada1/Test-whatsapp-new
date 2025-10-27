import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApiCallLog extends Document {
  apiKey: mongoose.Schema.Types.ObjectId;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestBody?: any;
  responseStatus: number;
  responseBody?: any;
  responseTime?: number; // in milliseconds
  userAgent?: string;
  ipAddress?: string;
  error?: string; // error message if any
  createdAt: Date;
  updatedAt: Date;
}

const ApiCallLogSchema = new Schema<IApiCallLog>(
  {
    apiKey: { 
      type: Schema.Types.ObjectId, 
      ref: "ApiKey", 
      required: true, 
      index: true 
    },
    endpoint: { 
      type: String, 
      required: true, 
      index: true 
    },
    method: { 
      type: String, 
      required: true, 
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] 
    },
    requestBody: { 
      type: Schema.Types.Mixed 
    },
    responseStatus: { 
      type: Number, 
      required: true, 
      index: true 
    },
    responseBody: { 
      type: Schema.Types.Mixed 
    },
    responseTime: { 
      type: Number 
    }, // in milliseconds
    userAgent: { 
      type: String 
    },
    ipAddress: { 
      type: String 
    },
    error: { 
      type: String 
    }, // error message if any
  },
  { timestamps: true }
);

// Index for efficient querying
ApiCallLogSchema.index({ apiKey: 1, createdAt: -1 });
ApiCallLogSchema.index({ endpoint: 1, createdAt: -1 });
ApiCallLogSchema.index({ responseStatus: 1, createdAt: -1 });

export const ApiCallLog: Model<IApiCallLog> = mongoose.models.ApiCallLog || mongoose.model<IApiCallLog>("ApiCallLog", ApiCallLogSchema);

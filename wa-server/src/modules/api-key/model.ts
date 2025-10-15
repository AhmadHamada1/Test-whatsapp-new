import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApiKey extends Document {
  label?: string;
  tokenHash: string;
  tokenPrefix?: string;
  status: "active" | "revoked";
  createdBy: mongoose.Schema.Types.ObjectId;
  usageCount: number;
  lastUsedAt?: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>(
  {
    label: { type: String },
    tokenHash: { type: String, required: true, unique: true, index: true },
    tokenPrefix: { type: String },
    status: { type: String, enum: ["active", "revoked"], default: "active", index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    usageCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date },
    revokedAt: { type: Date },
  },
  { timestamps: true }
);

export const ApiKey: Model<IApiKey> = mongoose.models.ApiKey || mongoose.model<IApiKey>("ApiKey", ApiKeySchema);

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

// Connection Types
export interface Connection {
  connectionId: string;
  status: ConnectionStatus;
  qrCode?: string;
  createdAt: Date;
  lastActivity?: Date;
  name?: string;
}

export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

// Message Types
export interface Message {
  messageId: string;
  connectionId: string;
  to: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  sentAt: Date;
  mediaUrl?: string;
}

export type MessageType = "text" | "image" | "document" | "audio" | "video";
export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed";

// Request Types
export interface CreateConnectionRequest {
  name?: string;
}

export interface UpdateConnectionStatusRequest {
  status: ConnectionStatus;
}

export interface SendMessageRequest {
  connectionId: string;
  to: string;
  content: string;
  type?: MessageType;
  mediaUrl?: string;
}

// Express Request/Response Extensions
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  apiKey?: string;
}

// Environment Configuration
export interface Config {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  API_KEY_SECRET?: string | undefined;
}

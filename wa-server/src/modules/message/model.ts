import mongoose, { Schema, Document, Model } from "mongoose";
import { MessageType, MessageStatus } from "../../types";

export interface IMessage extends Document {
  messageId: string; // WhatsApp message ID
  connectionId: string; // Connection ID that sent/received this message
  to: string; // Recipient phone number
  from?: string; // Sender phone number (for received messages)
  content: string; // Message content
  type: MessageType; // Message type (text, image, etc.)
  status: MessageStatus; // Message status
  direction: 'sent' | 'received'; // Whether message was sent or received
  mediaUrl?: string; // URL for media messages
  whatsappMessageId?: string; // Original WhatsApp message ID
  sentAt: Date; // When message was sent
  deliveredAt?: Date; // When message was delivered
  readAt?: Date; // When message was read
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    messageId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    connectionId: { 
      type: String, 
      required: true, 
      index: true 
    },
    to: { 
      type: String, 
      required: true, 
      index: true 
    },
    from: { 
      type: String, 
      index: true 
    },
    content: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["text", "image", "document", "audio", "video"], 
      default: "text", 
      index: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "sent", "delivered", "read", "failed"], 
      default: "sent", 
      index: true 
    },
    direction: { 
      type: String, 
      enum: ["sent", "received"], 
      required: true, 
      index: true 
    },
    mediaUrl: { 
      type: String 
    },
    whatsappMessageId: { 
      type: String, 
      index: true 
    },
    sentAt: { 
      type: Date, 
      required: true, 
      index: true 
    },
    deliveredAt: { 
      type: Date 
    },
    readAt: { 
      type: Date 
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
MessageSchema.index({ connectionId: 1, sentAt: -1 });
MessageSchema.index({ connectionId: 1, direction: 1 });
MessageSchema.index({ to: 1, sentAt: -1 });
MessageSchema.index({ status: 1, sentAt: -1 });

export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

// Message Types
export type MessageType = "text" | "image" | "document" | "audio" | "video"
export type MessageStatus = "pending" | "sent" | "delivered" | "read" | "failed"

export interface Message {
  messageId: string
  connectionId: string
  to: string
  content: string
  type: MessageType
  status: MessageStatus
  sentAt: string
  mediaUrl?: string
}

import { Message, IMessage } from "./model";
import { MessageType, MessageStatus } from "../../types";

export class MessageService {
  /**
   * Save a sent message to the database
   */
  static async saveSentMessage(data: {
    messageId: string;
    connectionId: string;
    to: string;
    content: string;
    type?: MessageType;
    status?: MessageStatus;
    mediaUrl?: string;
    whatsappMessageId?: string;
    sentAt?: Date;
  }): Promise<IMessage> {
    const message = new Message({
      messageId: data.messageId,
      connectionId: data.connectionId,
      to: data.to,
      content: data.content,
      type: data.type || "text",
      status: data.status || "sent",
      direction: "sent",
      mediaUrl: data.mediaUrl,
      whatsappMessageId: data.whatsappMessageId,
      sentAt: data.sentAt || new Date()
    });

    return await message.save();
  }

  /**
   * Save a received message to the database
   */
  static async saveReceivedMessage(data: {
    messageId: string;
    connectionId: string;
    from: string;
    content: string;
    type?: MessageType;
    status?: MessageStatus;
    mediaUrl?: string;
    whatsappMessageId?: string;
    sentAt?: Date;
  }): Promise<IMessage> {
    const message = new Message({
      messageId: data.messageId,
      connectionId: data.connectionId,
      from: data.from,
      content: data.content,
      type: data.type || "text",
      status: data.status || "sent",
      direction: "received",
      mediaUrl: data.mediaUrl,
      whatsappMessageId: data.whatsappMessageId,
      sentAt: data.sentAt || new Date()
    });

    return await message.save();
  }

  /**
   * Update message status
   */
  static async updateMessageStatus(
    messageId: string, 
    status: MessageStatus, 
    additionalData?: {
      deliveredAt?: Date;
      readAt?: Date;
    }
  ): Promise<IMessage | null> {
    const updateData: any = { status };
    
    if (additionalData?.deliveredAt) {
      updateData.deliveredAt = additionalData.deliveredAt;
    }
    
    if (additionalData?.readAt) {
      updateData.readAt = additionalData.readAt;
    }

    return await Message.findOneAndUpdate(
      { messageId },
      updateData,
      { new: true }
    );
  }

  /**
   * Get messages for a connection
   */
  static async getMessagesByConnection(
    connectionId: string,
    options: {
      limit?: number;
      offset?: number;
      direction?: 'sent' | 'received';
      status?: MessageStatus;
    } = {}
  ): Promise<IMessage[]> {
    const query: any = { connectionId };
    
    if (options.direction) {
      query.direction = options.direction;
    }
    
    if (options.status) {
      query.status = options.status;
    }

    return await Message.find(query)
      .sort({ sentAt: -1 })
      .limit(options.limit || 50)
      .skip(options.offset || 0);
  }


  /**
   * Get message by WhatsApp message ID
   */
  static async getMessageByWhatsappId(whatsappMessageId: string): Promise<IMessage | null> {
    return await Message.findOne({ whatsappMessageId });
  }

  /**
   * Get message by message ID
   */
  static async getMessageById(messageId: string): Promise<IMessage | null> {
    return await Message.findOne({ messageId });
  }

  /**
   * Delete messages for a connection (useful for cleanup)
   */
  static async deleteMessagesByConnection(connectionId: string): Promise<number> {
    const result = await Message.deleteMany({ connectionId });
    return result.deletedCount || 0;
  }

  /**
   * Get message statistics for a connection
   */
  static async getMessageStats(connectionId: string): Promise<{
    total: number;
    sent: number;
    received: number;
    byStatus: Record<MessageStatus, number>;
    byType: Record<MessageType, number>;
  }> {
    const pipeline = [
      { $match: { connectionId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$direction", "sent"] }, 1, 0] } },
          received: { $sum: { $cond: [{ $eq: ["$direction", "received"] }, 1, 0] } },
          byStatus: {
            $push: {
              status: "$status"
            }
          },
          byType: {
            $push: {
              type: "$type"
            }
          }
        }
      }
    ];

    const result = await Message.aggregate(pipeline);
    
    if (result.length === 0) {
      return {
        total: 0,
        sent: 0,
        received: 0,
        byStatus: {} as Record<MessageStatus, number>,
        byType: {} as Record<MessageType, number>
      };
    }

    const data = result[0];
    const byStatus: Record<MessageStatus, number> = {} as Record<MessageStatus, number>;
    const byType: Record<MessageType, number> = {} as Record<MessageType, number>;

    // Count by status
    data.byStatus.forEach((item: any) => {
      const status = item.status as MessageStatus;
      byStatus[status] = (byStatus[status] || 0) + 1;
    });

    // Count by type
    data.byType.forEach((item: any) => {
      const type = item.type as MessageType;
      byType[type] = (byType[type] || 0) + 1;
    });

    return {
      total: data.total,
      sent: data.sent,
      received: data.received,
      byStatus,
      byType
    };
  }
}

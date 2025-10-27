import { Response } from "express";
import { AuthenticatedRequest, ApiResponse } from "../../../types";
import { MessageService } from "../../message";

export const getMessages = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<any>>
): Promise<void> => {
  try {
    const connectionId = req.params.id;
    const {
      limit = 50,
      offset = 0,
      direction,
      status
    } = req.query;

    // Validate connection ID
    if (!connectionId) {
      res.status(400).json({
        success: false,
        message: "Connection ID is required"
      });
      return;
    }

    // Parse query parameters
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    // Validate numeric parameters
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      res.status(400).json({
        success: false,
        message: "Limit must be a number between 1 and 100"
      });
      return;
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      res.status(400).json({
        success: false,
        message: "Offset must be a non-negative number"
      });
      return;
    }

    // Validate direction parameter
    if (direction && !['sent', 'received'].includes(direction as string)) {
      res.status(400).json({
        success: false,
        message: "Direction must be either 'sent' or 'received'"
      });
      return;
    }

    // Validate status parameter
    const validStatuses = ['pending', 'sent', 'delivered', 'read', 'failed'];
    if (status && !validStatuses.includes(status as string)) {
      res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }

    // Prepare query options
    const queryOptions: any = {
      limit: limitNum,
      offset: offsetNum
    };

    if (direction) {
      queryOptions.direction = direction as 'sent' | 'received';
    }

    if (status) {
      queryOptions.status = status as any;
    }

    // Get messages from database
    const messages = await MessageService.getMessagesByConnection(connectionId, queryOptions);

    // Get total count for pagination (without limit/offset)
    const countOptions: any = {};
    if (direction) {
      countOptions.direction = direction as 'sent' | 'received';
    }
    if (status) {
      countOptions.status = status as any;
    }

    const totalMessages = await MessageService.getMessagesByConnection(connectionId, countOptions);

    // Get message statistics
    const stats = await MessageService.getMessageStats(connectionId);

    // Format response data
    const formattedMessages = messages.map(message => ({
      messageId: message.messageId,
      connectionId: message.connectionId,
      to: message.to,
      from: message.from,
      content: message.content,
      type: message.type,
      status: message.status,
      direction: message.direction,
      mediaUrl: message.mediaUrl,
      whatsappMessageId: message.whatsappMessageId,
      sentAt: message.sentAt,
      deliveredAt: message.deliveredAt,
      readAt: message.readAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    }));

    res.json({
      success: true,
      message: "Messages retrieved successfully",
      data: {
        messages: formattedMessages,
        pagination: {
          total: totalMessages.length,
          limit: limitNum,
          offset: offsetNum,
          hasMore: offsetNum + limitNum < totalMessages.length
        },
        stats: {
          total: stats.total,
          sent: stats.sent,
          received: stats.received,
          byStatus: stats.byStatus,
          byType: stats.byType
        }
      }
    });

  } catch (error: any) {
    console.error("Error getting messages:", error);
    
    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
      data: {
        error: error.message
      }
    });
  }
};

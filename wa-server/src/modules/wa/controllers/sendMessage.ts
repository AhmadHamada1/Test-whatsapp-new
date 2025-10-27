import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, Message, SendMessageRequest } from "../../../types";
import WhatsappManager from "../../../core/WhatsappManager";
import { MessageService } from "../../message";

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Message>>
): Promise<void> => {
  try {
    const { to, content, type = "text" }: SendMessageRequest = req.body;

    // Get connection ID from URL params (since route is /connections/:id/message)
    const connectionId = req.params.id;

    // Validate required fields
    if (!connectionId || !to || !content) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: connectionId, to, and content are required"
      });
      return;
    }

    // Send message using WhatsappManager
    const messageResult = await WhatsappManager.sendMessage(connectionId, to, content);

    // Save message to database
    const savedMessage = await MessageService.saveSentMessage({
      messageId: messageResult.id._serialized,
      connectionId,
      to,
      content,
      type: type as any,
      status: "sent",
      whatsappMessageId: messageResult.id._serialized,
      sentAt: new Date()
    });

    // Create response data
    const messageData: Message = {
      messageId: savedMessage.messageId,
      connectionId: savedMessage.connectionId,
      to: savedMessage.to,
      content: savedMessage.content,
      type: savedMessage.type,
      status: savedMessage.status,
      sentAt: savedMessage.sentAt
    };

    res.json({
      success: true,
      message: "Message sent successfully",
      data: messageData
    });

  } catch (error: any) {
    console.error("Error sending message:", error.message);
    
    // Handle specific error cases
    if (error.message.includes("Session not found")) {
      res.status(404).json({
        success: false,
        message: "Connection not found or not active"
      });
      return;
    }
    
    if (error.message.includes("Client not ready")) {
      res.status(400).json({
        success: false,
        message: "WhatsApp client is not ready. Please ensure the connection is established and QR code is scanned."
      });
      return;
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: `Failed to send message: ${error.message}`
    });
  }
};
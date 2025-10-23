import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, Message } from "../../../types";

export const sendMessage = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Message>>
): Promise<void> => {
  res.json({
    success: true,
    message: "WIP: It will send a message in response",
    data: {
      messageId: "temp_msg_123",
      connectionId: req.body.connectionId,
      to: req.body.to,
      content: req.body.content,
      type: req.body.type || "text",
      status: "sent",
      sentAt: new Date()
    }
  });
};
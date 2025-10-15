import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, Connection, Message } from "../../types";

export const addConnection = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Connection>>
): Promise<void> => {
  res.json({ 
    success: true, 
    message: "WIP: It will send a QR in response",
    data: {
      connectionId: "temp_conn_123",
      status: "connecting",
      createdAt: new Date()
    }
  });
};

export const getConnectionStatus = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Connection>>
): Promise<void> => {
  res.json({ 
    success: true,
    message: "WIP: It will send a status in response",
    data: {
      connectionId: req.params.connectionId || "unknown",
      status: "connected",
      createdAt: new Date()
    }
  });
};

export const updateConnectionStatus = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Connection>>
): Promise<void> => {
  res.json({ 
    success: true,
    message: "WIP: It will send a status in response",
    data: {
      connectionId: req.params.connectionId || "unknown",
      status: req.body.status || "connected",
      createdAt: new Date()
    }
  });
};

export const disconnectConnection = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ connectionId: string; status: string }>>
): Promise<void> => {
  res.json({ 
    success: true,
    message: "WIP: It will send a status in response",
    data: {
      connectionId: req.params.connectionId || "unknown",
      status: "disconnected"
    }
  });
};

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

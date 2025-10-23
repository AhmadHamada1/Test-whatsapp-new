import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, Connection, Message } from "../../../types";
import { ConnectionService } from "../service";
import WAManager from "../manager";
import {
  getApiKeyId,
  transformConnection,
  sendError,
  sendSuccess,
  handleServiceError
} from "../lib/controller.helpers";

// Controller functions
export const addConnection = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Connection>>
): Promise<void> => {
  try {
    const apiKeyId = getApiKeyId(req);
    const { name } = req.body;
    console.log("name", name);
    // Create connection in database first
    const connection = await ConnectionService.createConnection(apiKeyId, name);
    const connectionId = (connection._id as any).toString();
    console.log("connectionId", connection);

    // Generate QR code using the manager
    const { qr } = await WAManager.createConnection(connectionId, apiKeyId);
    
    // Update the connection with the QR code and set status to connecting
    const updatedConnection = await ConnectionService.updateConnectionQRCode(connectionId, apiKeyId, qr);
    
    if (!updatedConnection) {
      sendError(res, 500, "Failed to update connection with QR code");
      return;
    }
    
    sendSuccess(res, "Connection created successfully", transformConnection(updatedConnection));
  } catch (error) {
    handleServiceError(error, res, "create connection");
  }
};
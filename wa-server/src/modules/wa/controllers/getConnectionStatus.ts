import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, Connection } from "../../../types";
import { ConnectionService } from "../service";
import WAManager from "../manager";
import {
  getApiKeyId,
  transformConnection,
  sendSuccess,
  validateConnectionId,
  handleConnectionNotFound,
  handleServiceError
} from "../lib/controller.helpers";

export const getConnectionStatus = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Connection>>
): Promise<void> => {
  try {
    const apiKeyId = getApiKeyId(req);
    const { id } = req.params;

    if (!validateConnectionId(id, res)) return;

    const connection = await ConnectionService.getConnectionById(id!, apiKeyId);
    if (!handleConnectionNotFound(connection, res)) return;

    // Check real-time status from manager
    const managerStatus = WAManager.getConnectionStatus(id!);
    if (!managerStatus.exists) {
      // Session not found in manager, but exists in database
      // This could mean the session was disconnected or never created
      console.warn(`Session not found in manager for connection ${id}, but exists in database`);
    }

    sendSuccess(res, "Connection status retrieved successfully", transformConnection(connection));
  } catch (error) {
    handleServiceError(error, res, "retrieve connection status");
  }
};
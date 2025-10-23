import { Response } from "express";
import { AuthenticatedRequest, ApiResponse } from "../../../types";
import { ConnectionService } from "../service";
import WAManager from "../manager";
import {
  getApiKeyId,
  sendError,
  sendSuccess,
  validateConnectionId,
  handleServiceError
} from "../lib/controller.helpers";

export const disconnectConnection = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ connectionId: string; status: string }>>
): Promise<void> => {
  try {
    const apiKeyId = getApiKeyId(req);
    const { id } = req.params;
    
    if (!validateConnectionId(id, res)) return;
    
    // Try to disconnect from manager first
    try {
      await WAManager.disconnect(id!);
    } catch (managerError) {
      // Session not found in manager, but continue with database cleanup
      console.warn(`Session not found in manager for connection ${id}:`, managerError);
    }
    
    const deleted = await ConnectionService.deleteConnection(id!, apiKeyId);
    if (!deleted) {
      sendError(res, 404, "Connection not found");
      return;
    }
    
    sendSuccess(res, "Connection disconnected successfully", { connectionId: id, status: "disconnected" });
  } catch (error) {
    handleServiceError(error, res, "disconnect connection");
  }
};

import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, Connection } from "../../../types";
import { ConnectionService } from "../service";
import {
  getApiKeyId,
  transformConnection,
  sendError,
  sendSuccess,
  validateConnectionId,
  handleConnectionNotFound,
  handleServiceError
} from "../lib/controller.helpers";

export const updateConnectionStatus = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Connection>>
): Promise<void> => {
  try {
    const apiKeyId = getApiKeyId(req);
    const { id } = req.params;
    const { status } = req.body;

    if (!validateConnectionId(id, res)) return;

    if (!status || !["connecting", "connected", "disconnected", "error"].includes(status)) {
      sendError(res, 400, "Invalid status. Must be one of: connecting, connected, disconnected, error");
      return;
    }

    const connection = await ConnectionService.updateConnectionStatus(id!, apiKeyId, status);
    if (!handleConnectionNotFound(connection, res)) return;

    sendSuccess(res, "Connection status updated successfully", transformConnection(connection));
  } catch (error) {
    handleServiceError(error, res, "update connection status");
  }
};
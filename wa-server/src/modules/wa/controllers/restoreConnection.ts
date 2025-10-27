import { Response } from "express";
import { AuthenticatedRequest, ApiResponse } from "../../../types";
import { ConnectionService } from "../service";
import WhatsappManager from "../../../core/WhatsappManager";
import {
  getApiKeyId,
  sendSuccess,
  validateConnectionId,
  handleConnectionNotFound,
  handleServiceError
} from "../lib/controller.helpers";

export const restoreConnection = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ success: boolean; message: string; status: string }>>
): Promise<void> => {
  try {
    const apiKeyId = getApiKeyId(req);
    const { id } = req.params;

    if (!validateConnectionId(id, res)) return;

    // Check if connection exists in database
    const connection = await ConnectionService.getConnectionById(id!, apiKeyId);
    if (!handleConnectionNotFound(connection, res)) return;

    // Check if connection is already active in manager
    if (WhatsappManager.hasConnection(id!)) {
      const realisticStatus = WhatsappManager.getRealisticStatus(id!);
      res.status(400).json({
        success: false,
        message: `Connection is already active with status: ${realisticStatus.status}`,
        data: {
          success: false,
          message: `Connection is already active with status: ${realisticStatus.status}`,
          status: realisticStatus.status
        }
      });
      return;
    }

    // Restore the connection
    const connectionId = (connection._id as any).toString();
    const result = await WhatsappManager.reloadSession(connectionId);

    if (result.success) {
      sendSuccess(res, "Connection restored successfully", {
        success: true,
        message: result.message,
        status: "needs_restore"
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        data: {
          success: false,
          message: result.message,
          status: "failed"
        }
      });
    }
  } catch (error) {
    handleServiceError(error, res, "restore connection");
  }
};

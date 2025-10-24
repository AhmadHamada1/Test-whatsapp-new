import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, Connection } from "../../../types";
import { ConnectionService } from "../service";
import WhatsappManager from "../../../core/WhatsappManager";
import {
  getApiKeyId,
  transformConnection,
  sendSuccess,
  validateConnectionId,
  handleConnectionNotFound,
  handleServiceError
} from "../lib/controller.helpers";

// Extended connection type for API responses
interface ExtendedConnection extends Omit<Connection, 'status'> {
  status: 'ready' | 'needs_restore' | 'disconnected' | 'expired';
  message: string;
  needsRestore: boolean;
}

export const getConnectionStatus = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ExtendedConnection>>
): Promise<void> => {
  try {
    const apiKeyId = getApiKeyId(req);
    const { id } = req.params;

    if (!validateConnectionId(id, res)) return;

    const connection = await ConnectionService.getConnectionById(id!, apiKeyId);
    if (!handleConnectionNotFound(connection, res)) return;

    // Get realistic status from manager
    const realisticStatus = WhatsappManager.getRealisticStatus(id!);
    
    const transformed = transformConnection(connection);
    
    // Override with realistic status
    const responseData = {
      ...transformed,
      status: realisticStatus.status,
      message: realisticStatus.message,
      needsRestore: realisticStatus.needsRestore
    };

    sendSuccess(res, "Connection status retrieved successfully", responseData);
  } catch (error) {
    handleServiceError(error, res, "retrieve connection status");
  }
};
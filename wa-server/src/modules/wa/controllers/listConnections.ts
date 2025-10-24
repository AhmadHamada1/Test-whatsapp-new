import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, Connection } from "../../../types";
import { ConnectionService } from "../service";
import WhatsappManager from "../../../core/WhatsappManager";
import {
  getApiKeyId,
  transformConnection,
  sendSuccess,
} from "../lib/controller.helpers";

// Extended connection type for API responses
interface ExtendedConnection extends Omit<Connection, 'status'> {
  status: 'ready' | 'needs_restore' | 'disconnected' | 'expired';
  message: string;
  needsRestore: boolean;
}

export const listConnections = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<ExtendedConnection[]>>
): Promise<void> => {
  try {
    const apiKeyId = getApiKeyId(req);
    const connections = await ConnectionService.getConnectionsByApiKey(apiKeyId);
    
    // Transform connections with realistic status from WhatsApp manager
    const transformedConnections = connections.map(connection => {
      const connectionId = (connection._id as any).toString();
      const realisticStatus = WhatsappManager.getRealisticStatus(connectionId);
      
      const transformed = transformConnection(connection);
      
      // Override status with realistic status
      return {
        ...transformed,
        status: realisticStatus.status,
        message: realisticStatus.message,
        needsRestore: realisticStatus.needsRestore
      };
    });
    
    sendSuccess(res, "Connections retrieved successfully", transformedConnections);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve connections",
      data: []
    });
  }
};
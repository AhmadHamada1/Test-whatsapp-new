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
  status: 'waiting_connection' | 'ready' | 'disconnected' | 'needs_restore' | 'error';
  message: string;
  needsRestore: boolean;
  clientInfo?: {
    phoneNumber?: string;
    platform?: string;
    phoneDetails?: {
      manufacturer?: string;
      model?: string;
      osVersion?: string;
      appVersion?: string;
    };
    whatsappInfo?: {
      profileName?: string;
      profilePicture?: string;
      isBusiness?: boolean;
      isVerified?: boolean;
    };
    connectionDetails?: {
      ipAddress?: string;
      userAgent?: string;
      connectedAt?: Date;
      lastSeen?: Date;
    };
  };
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
      
      // Override status with realistic status and include client info
      const result: ExtendedConnection = {
        ...transformed,
        status: realisticStatus.status,
        message: realisticStatus.message,
        needsRestore: realisticStatus.needsRestore
      };
      
      // Add client info if it exists
      if (connection.clientInfo) {
        result.clientInfo = connection.clientInfo;
      }
      
      return result;
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
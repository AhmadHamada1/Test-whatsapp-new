import { Response } from "express";
import { AuthenticatedRequest, ApiResponse, Connection } from "../../../types";
import { ConnectionService } from "../service";
import {
  getApiKeyId,
  transformConnection,
  sendSuccess,
} from "../lib/controller.helpers";

export const listConnections = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<Connection[]>>
): Promise<void> => {
  try {
    const apiKeyId = getApiKeyId(req);
    const connections = await ConnectionService.getConnectionsByApiKey(apiKeyId);
    const transformedConnections = connections.map(transformConnection);
    
    sendSuccess(res, "Connections retrieved successfully", transformedConnections);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to retrieve connections",
      data: []
    });
  }
};
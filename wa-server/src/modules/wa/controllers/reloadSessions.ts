import { Response } from "express";
import { AuthenticatedRequest, ApiResponse } from "../../../types";
import WhatsappManager from "../../../core/WhatsappManager";
import {
  sendSuccess,
  sendError,
  handleServiceError
} from "../lib/controller.helpers";

/**
 * Reload all past WhatsApp sessions or a specific session by connection ID
 */
export const reloadSessions = async (
  req: AuthenticatedRequest,
  res: Response<ApiResponse<{ message: string; reloadedCount?: number; success?: boolean }>>
): Promise<void> => {
  try {
    const { connectionId } = req.params;
    
    if (connectionId) {
      // Reload specific session
      console.log(`Manual reload requested for session: ${connectionId}`);
      
      const result = await WhatsappManager.reloadSession(connectionId);
      
      if (result.success) {
        sendSuccess(res, result.message, {
          message: result.message,
          success: true
        });
      } else {
        sendError(res, 400, result.message);
      }
    } else {
      // Reload all sessions
      console.log('Manual reload requested for all sessions');
      
      // Get current active sessions count before reload
      const activeSessionsBefore = WhatsappManager.listConnections().length;
      
      // Reload past sessions
      await WhatsappManager.reloadPastSessions();
      
      // Get active sessions count after reload
      const activeSessionsAfter = WhatsappManager.listConnections().length;
      const reloadedCount = activeSessionsAfter - activeSessionsBefore;
      
      sendSuccess(res, "Sessions reloaded successfully", {
        message: `Reloaded ${reloadedCount} sessions`,
        reloadedCount
      });
    }
  } catch (error) {
    handleServiceError(error, res, "reload sessions");
  }
};

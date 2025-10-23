import { Request, Response, NextFunction } from "express";
import { sha256 } from "../utils/crypto";
import { ApiKey } from "../modules/api-key/model";
import { AuthenticatedRequest } from "../types";

export async function requireApiKey(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const headerKey = req.header("x-api-key");
    if (!headerKey) {
      return next({ status: 401, message: "Missing API key" });
    }

    const tokenHash = sha256(headerKey);
    
    // Add timeout and better error handling for database query
    const apiKey = await ApiKey.findOne({ tokenHash, status: "active" })
      .maxTimeMS(5000) // 5 second timeout
      .lean(); // Use lean() for better performance
    
    if (!apiKey) {
      return next({ status: 401, message: "Invalid or inactive API key" });
    }

    // Update usage count asynchronously to avoid blocking the request
    ApiKey.findByIdAndUpdate(
      apiKey._id,
      { 
        $inc: { usageCount: 1 },
        lastUsedAt: new Date()
      }
    ).catch(err => {
      console.error('Failed to update API key usage:', err);
    });

    // Convert lean document to full document for compatibility
    req.apiKey = apiKey as any;
    next();
  } catch (err) {
    console.error('API key validation error:', err);
    
    // Handle specific MongoDB timeout errors
    if (err instanceof Error && err.message.includes('buffering timed out')) {
      return next({ 
        status: 503, 
        message: "Database temporarily unavailable. Please try again later." 
      });
    }
    
    // Handle other database errors
    if (err instanceof Error && err.message.includes('MongoError')) {
      return next({ 
        status: 503, 
        message: "Database error. Please try again later." 
      });
    }
    
    next(err);
  }
}

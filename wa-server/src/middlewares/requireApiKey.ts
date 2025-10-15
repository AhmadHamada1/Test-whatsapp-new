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
    const apiKey = await ApiKey.findOne({ tokenHash, status: "active" });
    if (!apiKey) {
      return next({ status: 401, message: "Invalid or inactive API key" });
    }

    apiKey.usageCount = (apiKey.usageCount || 0) + 1;
    apiKey.lastUsedAt = new Date();
    await apiKey.save();
    req.apiKey = apiKey as any;
    next();
  } catch (err) {
    next(err);
  }
}

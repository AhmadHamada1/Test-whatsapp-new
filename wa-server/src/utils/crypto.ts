import * as crypto from "crypto";

export function generateToken(byteLength: number = 32): string {
  return crypto.randomBytes(byteLength).toString("hex");
}

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

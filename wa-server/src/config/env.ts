import type { Config } from "../types";

function parseNumber(value: string | undefined, defaultValue: number): number {
  const parsed = parseInt(value || "", 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

const config: Config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseNumber(process.env.PORT, 4001),
  MONGODB_URI: process.env.MONGODB_URI || "",
  API_KEY_SECRET: process.env.API_KEY_SECRET || undefined,
};

export default config;

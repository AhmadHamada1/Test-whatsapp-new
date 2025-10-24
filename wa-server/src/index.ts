import * as dotenv from "dotenv";

// Load environment variables FIRST
dotenv.config();

import { Server } from "http";
import app from "./app";
import { connectToDatabase } from "./config/db";
import config from "./config/env";
import WhatsappManager from "./core/WhatsappManager";

async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectToDatabase(config.MONGODB_URI);

    // Reload past WhatsApp sessions
    // console.log('Reloading past WhatsApp sessions...');
    // await WhatsappManager.reloadPastSessions();

    // Start the server
    const server: Server = app.listen(config.PORT, () => {
      console.log(`🚀 WhatsApp Server running on port ${config.PORT}`);
      console.log(`🌐 Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string): void => {
      console.log(`${signal} received, shutting down gracefully`);
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

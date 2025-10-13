"use strict";

require("dotenv").config();

const app = require("./app");
const { connectToDatabase } = require("./config/db");
const { restoreExistingConnections, cleanupDisconnectedSessions } = require("./services/wa.service");
const config = require("./config/env");

async function startServer() {
  try {
    // Connect to database
    await connectToDatabase(config.MONGODB_URI);
    
    // Restore existing WhatsApp connections
    await restoreExistingConnections();
    
    // Start cleanup interval for disconnected sessions
    setInterval(cleanupDisconnectedSessions, 5 * 60 * 1000); // Every 5 minutes
    
    // Start the server
    const server = app.listen(config.PORT, () => {
      console.log(`WhatsApp Server running on port ${config.PORT}`);
      console.log(`Environment: ${config.NODE_ENV}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully");
      server.close(() => {
        console.log("Process terminated");
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

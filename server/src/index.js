"use strict";

require("dotenv").config();
const { PORT, MONGODB_URI } = require("./config/env");
const { connectToDatabase } = require("./config/db");
const { createApp } = require("./app");
const { restoreExistingConnections, cleanupDisconnectedSessions } = require("./modules/wa/service");

(async () => {
  try {
    await connectToDatabase(MONGODB_URI);

    // Clean up disconnected sessions first
    await cleanupDisconnectedSessions();
    
    // Restore existing WhatsApp connections
    await restoreExistingConnections();

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server", err);
    process.exit(1);
  }
})();



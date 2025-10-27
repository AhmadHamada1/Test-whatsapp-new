"use strict";

require("dotenv").config();
const { PORT, MONGODB_URI } = require("./config/env");
const { connectToDatabase } = require("./config/db");
const { createApp } = require("./app");

(async () => {
  try {
    await connectToDatabase(MONGODB_URI);

    const app = createApp();
    app.listen(PORT, () => {
      console.log(`Core server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start core server", err);
    process.exit(1);
  }
})();



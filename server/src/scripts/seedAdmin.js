"use strict";

require("dotenv").config();
const mongoose = require("mongoose");
const { connectToDatabase } = require("../config/db");
const { MONGODB_URI } = require("../config/env");
const { createAdmin, findAdminByEmail } = require("../modules/admin/service");

(async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
    }

    await connectToDatabase(MONGODB_URI);
    const existing = await findAdminByEmail(email);
    if (existing) {
      console.log(`Admin already exists: ${email}`);
    } else {
      await createAdmin(email, password);
      console.log(`Admin created: ${email}`);
    }
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();



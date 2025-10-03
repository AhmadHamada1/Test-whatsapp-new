"use strict";

const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    passwordChangedAt: { type: Date },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

module.exports = { Admin };



"use strict";

const bcrypt = require("bcryptjs");
const { Admin } = require("./model");

async function findAdminByEmail(email) {
  return Admin.findOne({ email });
}

async function createAdmin(email, password) {
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({ email, passwordHash });
  return admin;
}

async function changePassword(adminId, currentPassword, newPassword) {
  const admin = await Admin.findById(adminId);
  if (!admin) throw Object.assign(new Error("Admin not found"), { status: 404 });
  const ok = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!ok) throw Object.assign(new Error("Invalid current password"), { status: 400 });
  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  admin.passwordChangedAt = new Date();
  await admin.save();
  return admin;
}

module.exports = { findAdminByEmail, createAdmin, changePassword };



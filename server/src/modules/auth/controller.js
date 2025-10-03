"use strict";

const bcrypt = require("bcryptjs");
const { findAdminByEmail } = require("../admin/service");
const { signJwt } = require("../../core/utils/jwt");

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const admin = await findAdminByEmail(email);
    if (!admin) return next({ status: 401, message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) return next({ status: 401, message: "Invalid credentials" });

    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signJwt({ sub: String(admin._id), role: "admin" });
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res) {
  res.json({ admin: { id: req.admin._id, email: req.admin.email } });
}

module.exports = { login, me };



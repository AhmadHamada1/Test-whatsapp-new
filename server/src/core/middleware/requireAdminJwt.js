"use strict";

const { verifyJwt } = require("../utils/jwt");
const { Admin } = require("../../modules/admin/model");

async function requireAdminJwt(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");
    if (!token) return next({ status: 401, message: "Unauthorized" });
    const payload = verifyJwt(token);
    if (!payload || payload.role !== "admin") return next({ status: 401, message: "Unauthorized" });
    const admin = await Admin.findById(payload.sub);
    if (!admin) return next({ status: 401, message: "Unauthorized" });
    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAdminJwt };



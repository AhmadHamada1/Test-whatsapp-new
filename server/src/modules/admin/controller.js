"use strict";

const { changePassword } = require("./service");

async function changePasswordHandler(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    await changePassword(req.admin._id, currentPassword, newPassword);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { changePasswordHandler };



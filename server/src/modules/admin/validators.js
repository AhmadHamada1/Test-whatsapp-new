"use strict";

const { z } = require("zod");

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8),
});

module.exports = { changePasswordSchema };



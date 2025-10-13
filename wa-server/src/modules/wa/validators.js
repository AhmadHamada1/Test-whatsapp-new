"use strict";

const { z } = require("zod");
const { VALIDATION_MESSAGES } = require("./constants");

const sendSchema = z
  .object({
    to: z.string().min(6, VALIDATION_MESSAGES.INVALID_RECIPIENT),
    text: z.string().min(1).optional(),
    media: z
      .object({
        mimetype: z.string().min(1),
        filename: z.string().min(1),
        dataBase64: z.string().min(1),
      })
      .optional(),
    connectionId: z.string().min(1, VALIDATION_MESSAGES.CONNECTION_ID_REQUIRED),
  })
  .refine((v) => Boolean(v.text) || Boolean(v.media), {
    message: VALIDATION_MESSAGES.TEXT_OR_MEDIA_REQUIRED,
    path: ["text"],
  });

module.exports = { sendSchema };

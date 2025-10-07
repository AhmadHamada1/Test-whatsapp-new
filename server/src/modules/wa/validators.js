"use strict";

const { z } = require("zod");

const sendSchema = z
  .object({
    to: z.string().min(6, "Invalid recipient"),
    text: z.string().min(1).optional(),
    media: z
      .object({
        mimetype: z.string().min(1),
        filename: z.string().min(1),
        dataBase64: z.string().min(1),
      })
      .optional(),
    connectionId: z.string().min(1, "Connection ID is required"),
  })
  .refine((v) => Boolean(v.text) || Boolean(v.media), {
    message: "Either text or media must be provided",
    path: ["text"],
  });

module.exports = { sendSchema };



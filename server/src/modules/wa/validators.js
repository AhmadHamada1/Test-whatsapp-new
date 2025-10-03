"use strict";

const { z } = require("zod");

const sendTextSchema = z.object({
  to: z.string().min(6, "Invalid recipient"),
  text: z.string().min(1, "Message text required"),
});

const sendMediaSchema = z.object({
  to: z.string().min(6, "Invalid recipient"),
  media: z.object({
    mimetype: z.string().min(1),
    filename: z.string().min(1),
    dataBase64: z.string().min(1),
  }),
});

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
  })
  .refine((v) => Boolean(v.text) || Boolean(v.media), {
    message: "Either text or media must be provided",
    path: ["text"],
  });

module.exports = { sendTextSchema, sendMediaSchema, sendSchema };



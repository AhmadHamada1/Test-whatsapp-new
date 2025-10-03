"use strict";

const { z } = require("zod");

const createSchema = z.object({
  label: z.string().max(100).optional(),
});

module.exports = { createSchema };



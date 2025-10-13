"use strict";

const { ZodError } = require("zod");

function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      if (schema && typeof schema.parse === "function") {
        req[source] = schema.parse(req[source]);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next({ status: 400, message: "Validation failed", details: err.issues });
      }
      return next(err);
    }
  };
}

module.exports = { validate };
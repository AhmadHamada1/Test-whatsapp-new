"use strict";

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const details = err.details;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ error: { message, details } });
}

module.exports = { errorHandler };



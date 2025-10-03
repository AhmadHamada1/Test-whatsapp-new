"use strict";

const cors = require("cors");
const { DASHBOARD_ORIGIN } = require("./env");

function createCorsMiddleware() {
  const origin = function (requestOrigin, callback) {
    if (!requestOrigin) return callback(null, true);
    if (DASHBOARD_ORIGIN && requestOrigin === DASHBOARD_ORIGIN) return callback(null, true);
    return callback(null, false);
  };

  return cors({ origin, credentials: true });
}

module.exports = { createCorsMiddleware };



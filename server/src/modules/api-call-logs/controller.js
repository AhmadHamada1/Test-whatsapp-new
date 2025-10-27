"use strict";

const { getApiCallLogs, getApiCallStats } = require("./service");

async function getLogsHandler(req, res, next) {
  try {
    const apiKeyId = req.params.apiKeyId;
    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      endpoint: req.query.endpoint,
      method: req.query.method,
      responseStatus: req.query.status ? parseInt(req.query.status) : undefined,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await getApiCallLogs(apiKeyId, options);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function getStatsHandler(req, res, next) {
  try {
    const apiKeyId = req.params.apiKeyId;
    const options = {
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const stats = await getApiCallStats(apiKeyId, options);
    res.json({ ok: true, data: stats });
  } catch (err) {
    next(err);
  }
}

module.exports = { getLogsHandler, getStatsHandler };

"use strict";

const { addNumber, sendTextMessage, sendMediaMessage } = require("./service");

async function addNumberHandler(req, res, next) {
  try {
    const result = await addNumber(req.apiKey._id);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function sendTextHandler(req, res, next) {
  try {
    const { to, text } = req.body;
    const result = await sendTextMessage(req.apiKey._id, to, text);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

async function sendMediaHandler(req, res, next) {
  try {
    const { to, media } = req.body;
    const result = await sendMediaMessage(req.apiKey._id, to, media);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { addNumberHandler, sendTextHandler, sendMediaHandler };

async function sendHandler(req, res, next) {
  try {
    const { to, text, media } = req.body;
    const result = text
      ? await sendTextMessage(req.apiKey._id, to, text)
      : await sendMediaMessage(req.apiKey._id, to, media);
    res.json({ ok: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports.sendHandler = sendHandler;



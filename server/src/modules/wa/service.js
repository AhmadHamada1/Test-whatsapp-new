"use strict";

const { WaConnection } = require("./model");

// Admin APIs
async function listConnections(apiKeyId) {
  const connections = await WaConnection.find({ apiKey: apiKeyId })
    .select('status lastQrAt readyAt disconnectedAt createdAt phoneNumber whatsappId profileName platform profilePictureUrl statusMessage lastSeen')
    .sort({ createdAt: -1 });

  return connections.map(conn => ({
    id: conn._id,
    status: conn.status,
    lastQrAt: conn.lastQrAt,
    readyAt: conn.readyAt,
    disconnectedAt: conn.disconnectedAt,
    createdAt: conn.createdAt,
    accountInfo: {
      phoneNumber: conn.phoneNumber,
      whatsappId: conn.whatsappId,
      profileName: conn.profileName,
      platform: conn.platform,
      profilePictureUrl: conn.profilePictureUrl,
      statusMessage: conn.statusMessage,
      lastSeen: conn.lastSeen
    }
  }));
}

module.exports = {
  listConnections,
};

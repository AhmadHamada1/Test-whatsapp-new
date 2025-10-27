"use strict";

const mongoose = require('mongoose');
const { WaConnection } = require('../src/modules/wa/model');
const { 
  listConnections,
  getConnectionStatus,
  cleanupDisconnectedSessions 
} = require('../src/modules/wa/service');

// Mock whatsapp-web.js
jest.mock('whatsapp-web.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    once: jest.fn(),
    initialize: jest.fn(),
    destroy: jest.fn()
  })),
  MessageMedia: jest.fn(),
  RemoteAuth: jest.fn(),
  NoAuth: jest.fn()
}));

// Mock wwebjs-mongo
jest.mock('wwebjs-mongo', () => ({
  MongoStore: jest.fn().mockImplementation(() => ({
    sessionExists: jest.fn(),
    save: jest.fn(),
    extract: jest.fn(),
    delete: jest.fn()
  }))
}));

describe('WhatsApp Service Tests', () => {
  let testApiKeyId;

  beforeAll(async () => {
    testApiKeyId = new mongoose.Types.ObjectId();
  });

  beforeEach(async () => {
    // Clean up before each test
    await WaConnection.deleteMany({});
  });

  describe('Connection Management', () => {
    test('listConnections returns connections for API key', async () => {
      // Create multiple connections directly in database
      const connection1 = new WaConnection({
        apiKey: testApiKeyId,
        status: 'ready',
        phoneNumber: '+1234567890',
        profileName: 'User 1'
      });
      await connection1.save();
      
      const connection2 = new WaConnection({
        apiKey: testApiKeyId,
        status: 'pending',
        connectionStep: 'qr_generated'
      });
      await connection2.save();
      
      const connections = await listConnections(testApiKeyId);
      
      expect(connections).toHaveLength(2);
      expect(connections[0]).toHaveProperty('id');
      expect(connections[0]).toHaveProperty('status');
      expect(connections[0]).toHaveProperty('accountInfo');
    });
  });

  describe('Connection Status', () => {
    test('getConnectionStatus returns not_started when no connections', async () => {
      const status = await getConnectionStatus(testApiKeyId);
      
      expect(status.status).toBe('not_started');
      expect(status.message).toContain('No connection attempt found');
    });

    test('getConnectionStatus returns connection info when exists', async () => {
      // Create connection directly in database
      const connection = new WaConnection({
        apiKey: testApiKeyId,
        status: 'ready',
        phoneNumber: '+1234567890',
        profileName: 'Test User',
        platform: 'android'
      });
      await connection.save();
      
      const status = await getConnectionStatus(testApiKeyId);
      
      expect(status.status).toBe('ready');
      expect(status.accountInfo.phoneNumber).toBe('+1234567890');
      expect(status.accountInfo.profileName).toBe('Test User');
    });
  });

  describe('Session Cleanup', () => {
    test('cleanupDisconnectedSessions removes disconnected sessions', async () => {
      // Create disconnected connections directly in database
      const connection1 = new WaConnection({
        apiKey: testApiKeyId,
        status: 'disconnected',
        phoneNumber: '+1234567890'
      });
      await connection1.save();
      
      const connection2 = new WaConnection({
        apiKey: testApiKeyId,
        status: 'ready',
        phoneNumber: '+9876543210'
      });
      await connection2.save();
      
      // Mock the store methods
      const { MongoStore } = require('wwebjs-mongo');
      const mockStore = new MongoStore();
      mockStore.sessionExists.mockResolvedValue(true);
      mockStore.delete.mockResolvedValue(true);
      
      await cleanupDisconnectedSessions();
      
      // Verify only disconnected connection was cleaned up
      expect(mockStore.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('getConnectionStatus handles invalid connectionId', async () => {
      const invalidId = new mongoose.Types.ObjectId();
      
      await expect(getConnectionStatus(testApiKeyId, invalidId))
        .rejects.toThrow('Connection not found');
    });
  });
});

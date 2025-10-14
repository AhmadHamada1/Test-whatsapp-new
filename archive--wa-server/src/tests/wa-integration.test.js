"use strict";

const request = require('supertest');
const mongoose = require('mongoose');
const { createApp } = require('../src/app');
const { WaConnection } = require('../models/wa.model');

// Mock whatsapp-web.js to avoid real WhatsApp connections
jest.mock('whatsapp-web.js', () => ({
  Client: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    once: jest.fn(),
    initialize: jest.fn(),
    destroy: jest.fn(),
    sendMessage: jest.fn().mockResolvedValue({
      id: { id: 'msg_123' },
      timestamp: Date.now()
    })
  })),
  MessageMedia: jest.fn(),
  RemoteAuth: jest.fn(),
  NoAuth: jest.fn()
}));

// Mock wwebjs-mongo
jest.mock('wwebjs-mongo', () => ({
  MongoStore: jest.fn().mockImplementation(() => ({
    sessionExists: jest.fn().mockResolvedValue(false),
    save: jest.fn().mockResolvedValue(true),
    extract: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue(true)
  }))
}));

describe('WhatsApp Integration Tests', () => {
  let app;
  let testApiKeyId;

  beforeAll(async () => {
    testApiKeyId = new mongoose.Types.ObjectId();
  });

  beforeEach(async () => {
    app = createApp();
    await WaConnection.deleteMany({});
  });

  describe('API Endpoints', () => {
    test('POST /wa/add-number creates new connection', async () => {
      const response = await request(app)
        .post('/wa/add-number')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('connectionId');
      expect(response.body.data).toHaveProperty('qr');
      expect(response.body.data).toHaveProperty('qrImage');
    });

    test('GET /wa/connections returns empty list initially', async () => {
      const response = await request(app)
        .get('/wa/connections')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    test('GET /wa/status returns not_started initially', async () => {
      const response = await request(app)
        .get('/wa/status')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.status).toBe('not_started');
    });

    test('POST /wa/send validates required fields', async () => {
      const response = await request(app)
        .post('/wa/send')
        .set('x-api-key', 'test-api-key')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Database Operations', () => {
    test('creates connection in database', async () => {
      await request(app)
        .post('/wa/add-number')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      const connections = await WaConnection.find({});
      expect(connections).toHaveLength(1);
      expect(connections[0].status).toBe('pending');
    });

    test('updates connection status', async () => {
      const response = await request(app)
        .post('/wa/add-number')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      const connectionId = response.body.data.connectionId;
      
      // Simulate connection becoming ready
      await WaConnection.findByIdAndUpdate(connectionId, {
        status: 'ready',
        phoneNumber: '+1234567890',
        profileName: 'Test User'
      });

      const statusResponse = await request(app)
        .get('/wa/status')
        .set('x-api-key', 'test-api-key')
        .expect(200);

      expect(statusResponse.body.data.status).toBe('ready');
    });
  });

  describe('Error Handling', () => {
    test('handles missing API key', async () => {
      const response = await request(app)
        .post('/wa/add-number')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('handles invalid connection ID', async () => {
      const response = await request(app)
        .get('/wa/status/invalid-id')
        .set('x-api-key', 'test-api-key')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});

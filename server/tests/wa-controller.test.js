"use strict";

const request = require('supertest');
const express = require('express');
const { addNumberHandler, listConnectionsHandler, getConnectionStatusHandler } = require('../src/modules/wa/controller');

// Mock the service layer
jest.mock('../src/modules/wa/service', () => ({
  addNumber: jest.fn(),
  listConnections: jest.fn(),
  getConnectionStatus: jest.fn(),
  sendTextMessage: jest.fn(),
  sendMediaMessage: jest.fn(),
  disconnectNumber: jest.fn()
}));

const { addNumber, listConnections, getConnectionStatus } = require('../src/modules/wa/service');

describe('WhatsApp Controller Tests', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock API key middleware
    app.use((req, res, next) => {
      req.apiKey = { _id: 'test-api-key-id' };
      next();
    });
    
    app.post('/wa/add-number', addNumberHandler);
    app.get('/wa/connections', listConnectionsHandler);
    app.get('/wa/status', getConnectionStatusHandler);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /wa/add-number', () => {
    test('returns connectionId and QR when creating new connection', async () => {
      const mockResponse = {
        connectionId: 'conn_123',
        qr: '2@ABC123DEF456',
        qrImage: 'data:image/png;base64,test'
      };
      
      addNumber.mockResolvedValue(mockResponse);
      
      const response = await request(app)
        .post('/wa/add-number')
        .expect(200);
      
      expect(response.body).toEqual({
        ok: true,
        data: mockResponse
      });
      expect(addNumber).toHaveBeenCalledWith('test-api-key-id');
    });

    test('returns alreadyConnected when connection exists', async () => {
      const mockResponse = {
        alreadyConnected: true,
        connectionId: 'conn_123',
        accountInfo: {
          phoneNumber: '+1234567890',
          profileName: 'Test User'
        }
      };
      
      addNumber.mockResolvedValue(mockResponse);
      
      const response = await request(app)
        .post('/wa/add-number')
        .expect(200);
      
      expect(response.body.data.alreadyConnected).toBe(true);
      expect(response.body.data.accountInfo).toBeDefined();
    });

    test('handles service errors', async () => {
      addNumber.mockRejectedValue(new Error('Service error'));
      
      const response = await request(app)
        .post('/wa/add-number')
        .expect(500);
      
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /wa/connections', () => {
    test('returns list of connections', async () => {
      const mockConnections = [
        {
          id: 'conn_1',
          status: 'ready',
          accountInfo: {
            phoneNumber: '+1234567890',
            profileName: 'User 1'
          }
        },
        {
          id: 'conn_2',
          status: 'pending',
          accountInfo: null
        }
      ];
      
      listConnections.mockResolvedValue(mockConnections);
      
      const response = await request(app)
        .get('/wa/connections')
        .expect(200);
      
      expect(response.body).toEqual({
        ok: true,
        data: mockConnections
      });
    });
  });

  describe('GET /wa/status', () => {
    test('returns connection status', async () => {
      const mockStatus = {
        connectionId: 'conn_123',
        status: 'ready',
        isReady: true,
        accountInfo: {
          phoneNumber: '+1234567890',
          profileName: 'Test User'
        }
      };
      
      getConnectionStatus.mockResolvedValue(mockStatus);
      
      const response = await request(app)
        .get('/wa/status')
        .expect(200);
      
      expect(response.body).toEqual({
        ok: true,
        data: mockStatus
      });
    });

    test('returns not_started when no connections', async () => {
      const mockStatus = {
        status: 'not_started',
        message: 'No connection attempt found'
      };
      
      getConnectionStatus.mockResolvedValue(mockStatus);
      
      const response = await request(app)
        .get('/wa/status')
        .expect(200);
      
      expect(response.body.data.status).toBe('not_started');
    });
  });
});

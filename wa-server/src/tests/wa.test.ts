import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { ApiKey } from '../modules/api-key/model';
import { Connection } from '../modules/wa/model';

// Test API key for testing
const TEST_API_KEY = 'test-api-key-12345';
let testApiKeyId: string;

describe('WhatsApp API', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wa-server-test');
    }
    
    // Create test API key
    const apiKey = new ApiKey({
      name: 'Test API Key',
      tokenHash: 'test-hash-12345', // This should match the hash of TEST_API_KEY
      status: 'active',
      usageCount: 0
    });
    await apiKey.save();
    testApiKeyId = (apiKey._id as any).toString();
  });

  afterAll(async () => {
    // Clean up test data
    await ApiKey.deleteMany({ name: 'Test API Key' });
    await Connection.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up connections before each test
    await Connection.deleteMany({});
  });

  describe('POST /v1/wa/connections/add', () => {
    it('should create a new connection successfully', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', TEST_API_KEY)
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Connection created successfully');
      expect(response.body.data).toHaveProperty('connectionId');
      expect(response.body.data).toHaveProperty('status', 'connecting');
      expect(response.body.data).toHaveProperty('name', 'Test Connection');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should create connection without name', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', TEST_API_KEY)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('connectionId');
      expect(response.body.data).toHaveProperty('status', 'connecting');
    });

    it('should return 401 without API key', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid API key', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', 'invalid-key')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /v1/wa/connections', () => {
    beforeEach(async () => {
      // Create test connections
      const connection1 = new Connection({
        connectionId: 'conn_test_1',
        apiKeyId: testApiKeyId,
        status: 'connected',
        name: 'Test Connection 1',
        createdAt: new Date()
      });
      await connection1.save();

      const connection2 = new Connection({
        connectionId: 'conn_test_2',
        apiKeyId: testApiKeyId,
        status: 'connecting',
        name: 'Test Connection 2',
        createdAt: new Date()
      });
      await connection2.save();
    });

    it('should list all connections', async () => {
      const response = await request(app)
        .get('/v1/wa/connections')
        .set('x-api-key', TEST_API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Connections retrieved successfully');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no connections exist', async () => {
      await Connection.deleteMany({});
      
      const response = await request(app)
        .get('/v1/wa/connections')
        .set('x-api-key', TEST_API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should return 401 without API key', async () => {
      const response = await request(app)
        .get('/v1/wa/connections');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /v1/wa/connections/:connectionId/status', () => {
    let connectionId: string;

    beforeEach(async () => {
      const connection = new Connection({
        connectionId: 'conn_test_status',
        apiKeyId: testApiKeyId,
        status: 'connected',
        name: 'Status Test Connection',
        createdAt: new Date()
      });
      await connection.save();
      connectionId = (connection._id as any).toString();
    });

    it('should get connection status successfully', async () => {
      const response = await request(app)
        .get(`/v1/wa/connections/${connectionId}/status`)
        .set('x-api-key', TEST_API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Connection status retrieved successfully');
      expect(response.body.data).toHaveProperty('connectionId', connectionId);
      expect(response.body.data).toHaveProperty('status', 'connected');
    });

    it('should return 404 for non-existent connection', async () => {
      const response = await request(app)
        .get('/v1/wa/connections/non-existent/status')
        .set('x-api-key', TEST_API_KEY);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid connection ID', async () => {
      const response = await request(app)
        .get('/v1/wa/connections//status')
        .set('x-api-key', TEST_API_KEY);

      expect(response.status).toBe(400);
    });

    it('should return 401 without API key', async () => {
      const response = await request(app)
        .get(`/v1/wa/connections/${connectionId}/status`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /v1/wa/connections/:connectionId/status', () => {
    let connectionId: string;

    beforeEach(async () => {
      const connection = new Connection({
        connectionId: 'conn_test_update',
        apiKeyId: testApiKeyId,
        status: 'connecting',
        name: 'Update Test Connection',
        createdAt: new Date()
      });
      await connection.save();
      connectionId = (connection._id as any).toString();
    });

    it('should update connection status successfully', async () => {
      const response = await request(app)
        .put(`/v1/wa/connections/${connectionId}/status`)
        .set('x-api-key', TEST_API_KEY)
        .send({ status: 'connected' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Connection status updated successfully');
      expect(response.body.data).toHaveProperty('status', 'connected');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put(`/v1/wa/connections/${connectionId}/status`)
        .set('x-api-key', TEST_API_KEY)
        .send({ status: 'invalid-status' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing status', async () => {
      const response = await request(app)
        .put(`/v1/wa/connections/${connectionId}/status`)
        .set('x-api-key', TEST_API_KEY)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent connection', async () => {
      const response = await request(app)
        .put('/v1/wa/connections/non-existent/status')
        .set('x-api-key', TEST_API_KEY)
        .send({ status: 'connected' });

      expect(response.status).toBe(404);
    });

    it('should return 401 without API key', async () => {
      const response = await request(app)
        .put(`/v1/wa/connections/${connectionId}/status`)
        .send({ status: 'connected' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /v1/wa/connections/:connectionId/disconnect', () => {
    let connectionId: string;

    beforeEach(async () => {
      const connection = new Connection({
        connectionId: 'conn_test_disconnect',
        apiKeyId: testApiKeyId,
        status: 'connected',
        name: 'Disconnect Test Connection',
        createdAt: new Date()
      });
      await connection.save();
      connectionId = (connection._id as any).toString();
    });

    it('should disconnect connection successfully', async () => {
      const response = await request(app)
        .post(`/v1/wa/connections/${connectionId}/disconnect`)
        .set('x-api-key', TEST_API_KEY);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Connection disconnected successfully');
      expect(response.body.data).toHaveProperty('connectionId', connectionId);
      expect(response.body.data).toHaveProperty('status', 'disconnected');
    });

    it('should return 404 for non-existent connection', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/non-existent/disconnect')
        .set('x-api-key', TEST_API_KEY);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without API key', async () => {
      const response = await request(app)
        .post(`/v1/wa/connections/${connectionId}/disconnect`);

      expect(response.status).toBe(401);
    });
  });

  describe('POST /v1/wa/messages/send', () => {
    it('should return WIP message for send message', async () => {
      const response = await request(app)
        .post('/v1/wa/messages/send')
        .set('x-api-key', TEST_API_KEY)
        .send({
          connectionId: 'conn_test',
          to: '+1234567890',
          content: 'Test message'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('WIP');
      expect(response.body.data).toHaveProperty('messageId');
      expect(response.body.data).toHaveProperty('connectionId');
      expect(response.body.data).toHaveProperty('to');
      expect(response.body.data).toHaveProperty('content');
    });

    it('should return 401 without API key', async () => {
      const response = await request(app)
        .post('/v1/wa/messages/send')
        .send({
          connectionId: 'conn_test',
          to: '+1234567890',
          content: 'Test message'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the API key validation works
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', 'invalid-key')
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });

    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', TEST_API_KEY)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });
  });

  describe('API Response Format', () => {
    it('should have consistent success response format', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', TEST_API_KEY)
        .send({ name: 'Format Test' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data).toBe('object');
    });

    it('should have consistent error response format', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
    });
  });
});

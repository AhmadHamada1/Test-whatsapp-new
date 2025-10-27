"use strict";

const request = require('supertest');
const mongoose = require('mongoose');
const { createApp } = require('../src/app');
const { ApiKey } = require('../src/modules/api-keys/model');

// Mock JWT for testing
jest.mock('../src/core/utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
  verifyToken: jest.fn().mockReturnValue({ userId: 'test-admin-id' })
}));

describe('API Keys API Tests', () => {
  let app;
  let testApiKey;
  let authToken;

  beforeAll(async () => {
    app = createApp();
  });

  beforeEach(async () => {
    // Clean up before each test
    await ApiKey.deleteMany({});
    
    // Create test API key
    testApiKey = new ApiKey({
      name: 'Test API Key',
      key: 'test-api-key-123',
      isActive: true,
      createdBy: new mongoose.Types.ObjectId()
    });
    await testApiKey.save();
    
    authToken = 'Bearer mock-jwt-token';
  });

  describe('GET /admin/api-keys', () => {
    test('should return list of API keys', async () => {
      const response = await request(app)
        .get('/admin/api-keys')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('apiKeys');
      expect(Array.isArray(response.body.data.apiKeys)).toBe(true);
      expect(response.body.data.apiKeys).toHaveLength(1);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/admin/api-keys')
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('POST /admin/api-keys', () => {
    test('should create new API key with valid data', async () => {
      const newApiKeyData = {
        name: 'New API Key',
        isActive: true
      };

      const response = await request(app)
        .post('/admin/api-keys')
        .set('Authorization', authToken)
        .send(newApiKeyData)
        .expect(201);

      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('apiKey');
      expect(response.body.data.apiKey.name).toBe('New API Key');
      expect(response.body.data.apiKey).toHaveProperty('key');
      expect(response.body.data.apiKey).toHaveProperty('createdAt');
    });

    test('should generate unique API key', async () => {
      const apiKeyData = {
        name: 'Unique API Key',
        isActive: true
      };

      const response = await request(app)
        .post('/admin/api-keys')
        .set('Authorization', authToken)
        .send(apiKeyData)
        .expect(201);

      expect(response.body.data.apiKey.key).toBeDefined();
      expect(response.body.data.apiKey.key).toMatch(/^[a-zA-Z0-9]{32}$/); // 32 character alphanumeric
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/admin/api-keys')
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/admin/api-keys')
        .send({
          name: 'New API Key',
          isActive: true
        })
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('GET /admin/api-keys/:id', () => {
    test('should return API key by ID', async () => {
      const response = await request(app)
        .get(`/admin/api-keys/${testApiKey._id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.apiKey._id).toBe(testApiKey._id.toString());
      expect(response.body.data.apiKey.name).toBe('Test API Key');
    });

    test('should return 404 for non-existent API key', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/admin/api-keys/${fakeId}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get(`/admin/api-keys/${testApiKey._id}`)
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('PUT /admin/api-keys/:id', () => {
    test('should update API key with valid data', async () => {
      const updateData = {
        name: 'Updated API Key',
        isActive: false
      };

      const response = await request(app)
        .put(`/admin/api-keys/${testApiKey._id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.apiKey.name).toBe('Updated API Key');
      expect(response.body.data.apiKey.isActive).toBe(false);
    });

    test('should not update the key field', async () => {
      const updateData = {
        name: 'Updated API Key',
        key: 'trying-to-change-key'
      };

      const response = await request(app)
        .put(`/admin/api-keys/${testApiKey._id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.data.apiKey.key).toBe('test-api-key-123'); // Original key unchanged
    });

    test('should return 404 for non-existent API key', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/admin/api-keys/${fakeId}`)
        .set('Authorization', authToken)
        .send({ name: 'Updated' })
        .expect(404);

      expect(response.body.ok).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .put(`/admin/api-keys/${testApiKey._id}`)
        .send({ name: 'Updated' })
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('DELETE /admin/api-keys/:id', () => {
    test('should delete API key', async () => {
      const response = await request(app)
        .delete(`/admin/api-keys/${testApiKey._id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    test('should return 404 for non-existent API key', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/admin/api-keys/${fakeId}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.ok).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/admin/api-keys/${testApiKey._id}`)
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('POST /admin/api-keys/:id/regenerate', () => {
    test('should regenerate API key', async () => {
      const originalKey = testApiKey.key;
      
      const response = await request(app)
        .post(`/admin/api-keys/${testApiKey._id}/regenerate`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.apiKey.key).not.toBe(originalKey);
      expect(response.body.data.apiKey.key).toMatch(/^[a-zA-Z0-9]{32}$/);
    });

    test('should return 404 for non-existent API key', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post(`/admin/api-keys/${fakeId}/regenerate`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.ok).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post(`/admin/api-keys/${testApiKey._id}/regenerate`)
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });
});

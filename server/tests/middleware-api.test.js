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

describe('Middleware API Tests', () => {
  let app;
  let testApiKey;

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
  });

  describe('API Key Middleware', () => {
    test('should allow access with valid API key', async () => {
      const response = await request(app)
        .get('/wa/status')
        .set('x-api-key', 'test-api-key-123')
        .expect(200);

      expect(response.body.ok).toBe(true);
    });

    test('should reject request without API key', async () => {
      const response = await request(app)
        .get('/wa/status')
        .expect(401);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('API key required');
    });

    test('should reject request with invalid API key', async () => {
      const response = await request(app)
        .get('/wa/status')
        .set('x-api-key', 'invalid-key')
        .expect(401);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('Invalid API key');
    });

    test('should reject request with inactive API key', async () => {
      // Deactivate the API key
      await ApiKey.findByIdAndUpdate(testApiKey._id, { isActive: false });

      const response = await request(app)
        .get('/wa/status')
        .set('x-api-key', 'test-api-key-123')
        .expect(401);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('API key is inactive');
    });

    test('should handle case-insensitive API key', async () => {
      const response = await request(app)
        .get('/wa/status')
        .set('x-api-key', 'TEST-API-KEY-123')
        .expect(200);

      expect(response.body.ok).toBe(true);
    });

    test('should handle API key with extra whitespace', async () => {
      const response = await request(app)
        .get('/wa/status')
        .set('x-api-key', '  test-api-key-123  ')
        .expect(200);

      expect(response.body.ok).toBe(true);
    });
  });

  describe('Admin JWT Middleware', () => {
    test('should allow access with valid JWT token', async () => {
      const response = await request(app)
        .get('/admin/admins')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body.ok).toBe(true);
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/admin/admins')
        .expect(401);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    test('should reject request with invalid token format', async () => {
      const response = await request(app)
        .get('/admin/admins')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.ok).toBe(false);
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/admin/admins')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.ok).toBe(false);
    });

    test('should handle missing Authorization header', async () => {
      const response = await request(app)
        .get('/admin/admins')
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('Validation Middleware', () => {
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/wa/send')
        .set('x-api-key', 'test-api-key-123')
        .send({})
        .expect(400);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    test('should validate field types', async () => {
      const response = await request(app)
        .post('/wa/send')
        .set('x-api-key', 'test-api-key-123')
        .send({
          to: 123, // Should be string
          text: 'test'
        })
        .expect(400);

      expect(response.body.ok).toBe(false);
    });

    test('should validate field formats', async () => {
      const response = await request(app)
        .post('/wa/send')
        .set('x-api-key', 'test-api-key-123')
        .send({
          to: 'invalid-phone-format',
          text: 'test'
        })
        .expect(400);

      expect(response.body.ok).toBe(false);
    });

    test('should allow valid data', async () => {
      const response = await request(app)
        .post('/wa/send')
        .set('x-api-key', 'test-api-key-123')
        .send({
          to: '1234567890',
          text: 'test message'
        })
        .expect(400); // Will fail due to no WhatsApp connection, but validation should pass

      // The error should be about connection, not validation
      expect(response.body.message).not.toContain('validation');
    });
  });

  describe('CORS Middleware', () => {
    test('should handle preflight requests', async () => {
      const response = await request(app)
        .options('/wa/status')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'GET')
        .expect(204);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });

    test('should include CORS headers in responses', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('Error Handling Middleware', () => {
    test('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error.message).toBe('Not Found');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/wa/send')
        .set('x-api-key', 'test-api-key-123')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle large payloads', async () => {
      const largeText = 'x'.repeat(10000); // 10KB text
      
      const response = await request(app)
        .post('/wa/send')
        .set('x-api-key', 'test-api-key-123')
        .send({
          to: '1234567890',
          text: largeText
        })
        .expect(400); // Should fail due to connection, not payload size

      expect(response.body.message).not.toContain('too large');
    });
  });

  describe('Rate Limiting', () => {
    test('should handle multiple rapid requests', async () => {
      const promises = Array(10).fill().map(() => 
        request(app)
          .get('/health')
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed (health endpoint has no rate limiting)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});

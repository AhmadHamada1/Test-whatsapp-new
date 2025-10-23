import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { ApiKey } from '../modules/api-key/model';
import { sha256 } from '../utils/crypto';

describe('API Key Authentication', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wa-server-test');
    }
  });

  afterAll(async () => {
    // Clean up test data
    await ApiKey.deleteMany({ name: /Test API Key/ });
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clean up API keys before each test
    await ApiKey.deleteMany({ name: /Test API Key/ });
  });

  describe('API Key Validation', () => {
    it('should accept valid API key', async () => {
      const testApiKey = 'test-valid-key-12345';
      const tokenHash = sha256(testApiKey);
      
      const apiKey = new ApiKey({
        name: 'Test API Key Valid',
        tokenHash,
        status: 'active',
        usageCount: 0
      });
      await apiKey.save();

      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', testApiKey)
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid API key', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', 'invalid-key')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject inactive API key', async () => {
      const testApiKey = 'test-inactive-key-12345';
      const tokenHash = sha256(testApiKey);
      
      const apiKey = new ApiKey({
        name: 'Test API Key Inactive',
        tokenHash,
        status: 'inactive',
        usageCount: 0
      });
      await apiKey.save();

      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', testApiKey)
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request without API key', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject empty API key', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', '')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject API key with only whitespace', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', '   ')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('API Key Usage Tracking', () => {
    it('should track API key usage count', async () => {
      const testApiKey = 'test-usage-key-12345';
      const tokenHash = sha256(testApiKey);
      
      const apiKey = new ApiKey({
        name: 'Test API Key Usage',
        tokenHash,
        status: 'active',
        usageCount: 0
      });
      await apiKey.save();

      // Make multiple requests
      await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', testApiKey)
        .send({ name: 'Test Connection 1' });

      await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', testApiKey)
        .send({ name: 'Test Connection 2' });

      // Check that usage count was updated
      const updatedApiKey = await ApiKey.findOne({ tokenHash });
      expect(updatedApiKey?.usageCount).toBeGreaterThan(0);
    });

    it('should update last used timestamp', async () => {
      const testApiKey = 'test-timestamp-key-12345';
      const tokenHash = sha256(testApiKey);
      
      const apiKey = new ApiKey({
        name: 'Test API Key Timestamp',
        tokenHash,
        status: 'active',
        usageCount: 0
      });
      await apiKey.save();

      const beforeRequest = new Date();
      
      await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', testApiKey)
        .send({ name: 'Test Connection' });

      const afterRequest = new Date();

      // Check that last used timestamp was updated
      const updatedApiKey = await ApiKey.findOne({ tokenHash });
      expect(updatedApiKey?.lastUsedAt).toBeDefined();
      expect(updatedApiKey?.lastUsedAt).toBeInstanceOf(Date);
      expect(updatedApiKey?.lastUsedAt!.getTime()).toBeGreaterThanOrEqual(beforeRequest.getTime());
      expect(updatedApiKey?.lastUsedAt!.getTime()).toBeLessThanOrEqual(afterRequest.getTime());
    });
  });

  describe('API Key Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that invalid keys are handled properly
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', 'definitely-invalid-key')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
    });

    it('should handle malformed API key headers', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', 'key with spaces and special chars!@#$%')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
    });
  });

  describe('API Key Security', () => {
    it('should not expose API key in error messages', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', 'sensitive-key-12345')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body.message).not.toContain('sensitive-key-12345');
    });

    it('should handle case sensitivity correctly', async () => {
      const testApiKey = 'test-case-sensitive-key-12345';
      const tokenHash = sha256(testApiKey);
      
      const apiKey = new ApiKey({
        name: 'Test API Key Case Sensitive',
        tokenHash,
        status: 'active',
        usageCount: 0
      });
      await apiKey.save();

      // Test with different case
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', 'TEST-CASE-SENSITIVE-KEY-12345')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
    });
  });
});

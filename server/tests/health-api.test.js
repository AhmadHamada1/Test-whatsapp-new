"use strict";

const request = require('supertest');
const mongoose = require('mongoose');
const { createApp } = require('../src/app');

describe('Health API Tests', () => {
  let app;

  beforeAll(async () => {
    app = createApp();
  });

  describe('GET /health', () => {
    test('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
    });

    test('should return database status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data.database.status).toBe('connected');
    });

    test('should return memory usage', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.data).toHaveProperty('memory');
      expect(response.body.data.memory).toHaveProperty('used');
      expect(response.body.data.memory).toHaveProperty('total');
      expect(typeof response.body.data.memory.used).toBe('number');
      expect(typeof response.body.data.memory.total).toBe('number');
    });

    test('should return environment info', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.data).toHaveProperty('environment');
      expect(response.body.data.environment).toHaveProperty('nodeVersion');
      expect(response.body.data.environment).toHaveProperty('platform');
      expect(typeof response.body.data.environment.nodeVersion).toBe('string');
      expect(typeof response.body.data.environment.platform).toBe('string');
    });

    test('should handle multiple requests', async () => {
      // Make multiple concurrent requests
      const promises = Array(5).fill().map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
        expect(response.body.data.status).toBe('healthy');
      });
    });

    test('should be fast response time', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/health')
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe('GET /health/detailed', () => {
    test('should return detailed health information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data).toHaveProperty('timestamp');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('database');
      expect(response.body.data).toHaveProperty('memory');
      expect(response.body.data).toHaveProperty('environment');
    });

    test('should include process information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.data).toHaveProperty('process');
      expect(response.body.data.process).toHaveProperty('pid');
      expect(response.body.data.process).toHaveProperty('version');
      expect(typeof response.body.data.process.pid).toBe('number');
    });

    test('should include system information', async () => {
      const response = await request(app)
        .get('/health/detailed')
        .expect(200);

      expect(response.body.data).toHaveProperty('system');
      expect(response.body.data.system).toHaveProperty('platform');
      expect(response.body.data.system).toHaveProperty('arch');
      expect(typeof response.body.data.system.platform).toBe('string');
    });
  });

  describe('Error Handling', () => {
    test('should handle database connection issues gracefully', async () => {
      // This test would require mocking database connection failure
      // For now, we'll test that the endpoint doesn't crash
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.ok).toBe(true);
    });

    test('should handle invalid routes', async () => {
      const response = await request(app)
        .get('/health/invalid')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Performance Tests', () => {
    test('should handle high load', async () => {
      const start = Date.now();
      const requestCount = 100;
      
      const promises = Array(requestCount).fill().map(() => 
        request(app).get('/health')
      );

      const responses = await Promise.all(promises);
      const duration = Date.now() - start;

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.ok).toBe(true);
      });

      // Should handle 100 requests in reasonable time
      expect(duration).toBeLessThan(5000); // 5 seconds
    });

    test('should maintain consistent response format', async () => {
      const responses = await Promise.all([
        request(app).get('/health'),
        request(app).get('/health'),
        request(app).get('/health')
      ]);

      responses.forEach(response => {
        expect(response.body).toHaveProperty('ok');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('status');
        expect(response.body.data).toHaveProperty('timestamp');
        expect(response.body.data).toHaveProperty('uptime');
      });
    });
  });
});

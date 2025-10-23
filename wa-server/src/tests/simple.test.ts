import request from 'supertest';
import app from '../app';

describe('Simple API Tests', () => {
  describe('Health Endpoints', () => {
    it('should return basic health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'it is working' });
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return database health status (may be unhealthy in test)', async () => {
      const response = await request(app).get('/health/db');
      
      // Database health can be either healthy or unhealthy
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      
      if (response.status === 200) {
        expect(response.body.status).toBe('healthy');
        expect(response.body.database).toBe('connected');
      } else {
        expect(response.body.status).toBe('unhealthy');
        expect(['disconnected', 'error']).toContain(response.body.database);
      }
    });
  });

  describe('WhatsApp API - Basic Tests', () => {
    it('should reject requests without API key', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Error');
      expect(response.body).toHaveProperty('message');
    });

    it('should reject requests with invalid API key', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', 'invalid-key')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Error');
      expect(response.body).toHaveProperty('message');
    });

    it('should reject requests with empty API key', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', '')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Error');
      expect(response.body).toHaveProperty('message');
    });

    it('should reject requests with whitespace-only API key', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', '   ')
        .send({ name: 'Test Connection' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Error');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('API Response Format', () => {
    it('should have consistent error response format', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Error');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
    });

    it('should return JSON content type for all responses', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add');

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON requests', async () => {
      const response = await request(app)
        .post('/v1/wa/connections/add')
        .set('x-api-key', 'test-key')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle unsupported HTTP methods', async () => {
      const response = await request(app)
        .patch('/health');

      expect(response.status).toBe(404);
    });

    it('should handle non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route');

      expect(response.status).toBe(404);
    });
  });

  describe('Performance Tests', () => {
    it('should respond to health check quickly', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/health');
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle concurrent health check requests', async () => {
      const promises = Array(10).fill(null).map(() => request(app).get('/health'));
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'it is working' });
      });
    });
  });

  describe('CORS and Headers', () => {
    it('should work with CORS headers', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'it is working' });
    });

    it('should work with different user agents', async () => {
      const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'curl/7.68.0',
        'PostmanRuntime/7.26.8'
      ];

      for (const userAgent of userAgents) {
        const response = await request(app)
          .get('/health')
          .set('User-Agent', userAgent);
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'it is working' });
      }
    });
  });
});

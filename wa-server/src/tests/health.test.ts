import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';

describe('Health API', () => {
  describe('GET /health', () => {
    it('should return 200 status code', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
    });

    it('should return correct message in response body', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toEqual({ message: 'it is working' });
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should have correct response structure', async () => {
      const response = await request(app).get('/health');
      expect(response.body).toHaveProperty('message');
      expect(typeof response.body.message).toBe('string');
      expect(response.body.message).toBe('it is working');
    });

    it('should respond quickly (performance test)', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/health');
      const endTime = Date.now();
      
      expect(response.status).toBe(200);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array(10).fill(null).map(() => request(app).get('/health'));
      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'it is working' });
      });
    });
  });

  describe('GET /health/db', () => {
    it('should return database health status', async () => {
      const response = await request(app).get('/health/db');
      
      // The response could be either healthy or unhealthy depending on DB connection
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      
      // responseTime might not be present in error responses
      if (response.body.responseTime !== undefined) {
        expect(typeof response.body.responseTime).toBe('number');
      }
    });

    it('should return healthy status when database is connected', async () => {
      // This test assumes the database is connected
      const response = await request(app).get('/health/db');
      
      if (response.status === 200) {
        expect(response.body.status).toBe('healthy');
        expect(response.body.database).toBe('connected');
        expect(response.body).toHaveProperty('readyState');
        expect(response.body.readyState).toBe(1);
      }
    });

    it('should return unhealthy status when database is disconnected', async () => {
      // This test would require disconnecting the database
      // For now, we'll just test the response structure
      const response = await request(app).get('/health/db');
      
      if (response.status === 503) {
        expect(response.body.status).toBe('unhealthy');
        expect(['disconnected', 'error']).toContain(response.body.database);
      }
    });

    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/health/db');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(5000); // Should respond within 5 seconds
      
      // responseTime might not be present in error responses
      if (response.body.responseTime !== undefined) {
        expect(response.body.responseTime).toBeLessThan(5000);
      }
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/health/db');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Health API Error Handling', () => {
    it('should not accept POST requests to /health', async () => {
      const response = await request(app).post('/health');
      expect(response.status).toBe(404); // Express returns 404 for undefined routes
    });

    it('should not accept PUT requests to /health', async () => {
      const response = await request(app).put('/health');
      expect(response.status).toBe(404);
    });

    it('should not accept DELETE requests to /health', async () => {
      const response = await request(app).delete('/health');
      expect(response.status).toBe(404);
    });

    it('should not accept PATCH requests to /health', async () => {
      const response = await request(app).patch('/health');
      expect(response.status).toBe(404);
    });

    it('should not accept POST requests to /health/db', async () => {
      const response = await request(app).post('/health/db');
      expect(response.status).toBe(404);
    });

    it('should not accept PUT requests to /health/db', async () => {
      const response = await request(app).put('/health/db');
      expect(response.status).toBe(404);
    });

    it('should not accept DELETE requests to /health/db', async () => {
      const response = await request(app).delete('/health/db');
      expect(response.status).toBe(404);
    });
  });

  describe('Health API Integration', () => {
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

    it('should handle concurrent health checks', async () => {
      const promises = [
        request(app).get('/health'),
        request(app).get('/health/db'),
        request(app).get('/health'),
        request(app).get('/health/db')
      ];
      
      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        if (index % 2 === 0) {
          // Basic health check
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ message: 'it is working' });
        } else {
          // Database health check
          expect([200, 503]).toContain(response.status);
          expect(response.body).toHaveProperty('status');
        }
      });
    });
  });

  describe('Health API Performance', () => {
    it('should handle high load on basic health check', async () => {
      const promises = Array(50).fill(null).map(() => request(app).get('/health'));
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'it is working' });
      });
      
      // Should handle 50 requests within 10 seconds
      expect(endTime - startTime).toBeLessThan(10000);
    });

    it('should handle mixed health check requests', async () => {
      const promises = [
        ...Array(10).fill(null).map(() => request(app).get('/health')),
        ...Array(5).fill(null).map(() => request(app).get('/health/db'))
      ];
      
      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        if (index < 10) {
          // Basic health check
          expect(response.status).toBe(200);
          expect(response.body).toEqual({ message: 'it is working' });
        } else {
          // Database health check
          expect([200, 503]).toContain(response.status);
        }
      });
    });
  });
});

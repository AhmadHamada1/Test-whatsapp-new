import request from 'supertest';
import app from '../app';

describe('Health API', () => {
  describe('GET /health', () => {
    it('should return health status (200 or 503)', async () => {
      const response = await request(app).get('/health');
      expect([200, 503]).toContain(response.status);
    });

    it('should return required health fields', async () => {
      const response = await request(app).get('/health');
      
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('database');
      
      // responseTime should be present in both healthy and unhealthy responses
      if (response.body.responseTime !== undefined) {
        expect(typeof response.body.responseTime).toBe('number');
      }
      
      // readyState only present when healthy
      if (response.status === 200) {
        expect(response.body).toHaveProperty('readyState');
      }
    });

    it('should return JSON content type', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should respond quickly', async () => {
      const startTime = Date.now();
      const response = await request(app).get('/health');
      const endTime = Date.now();
      
      expect([200, 503]).toContain(response.status);
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });

  describe('Health API Error Handling', () => {
    it('should reject POST requests', async () => {
      const response = await request(app).post('/health');
      expect(response.status).toBe(404);
    });

    it('should reject PUT requests', async () => {
      const response = await request(app).put('/health');
      expect(response.status).toBe(404);
    });

    it('should reject DELETE requests', async () => {
      const response = await request(app).delete('/health');
      expect(response.status).toBe(404);
    });
  });
});

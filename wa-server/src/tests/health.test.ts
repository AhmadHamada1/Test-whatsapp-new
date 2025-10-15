import request from 'supertest';
import app from '../app';

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

  describe('Health API Error Handling', () => {
    it('should not accept POST requests', async () => {
      const response = await request(app).post('/health');
      expect(response.status).toBe(404); // Express returns 404 for undefined routes
    });

    it('should not accept PUT requests', async () => {
      const response = await request(app).put('/health');
      expect(response.status).toBe(404);
    });

    it('should not accept DELETE requests', async () => {
      const response = await request(app).delete('/health');
      expect(response.status).toBe(404);
    });

    it('should not accept PATCH requests', async () => {
      const response = await request(app).patch('/health');
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
  });
});

"use strict";

const request = require('supertest');
const mongoose = require('mongoose');
const { createApp } = require('../src/app');
const { Admin } = require('../src/modules/admin/model');

// Mock JWT for testing
jest.mock('../src/core/utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
  verifyToken: jest.fn().mockReturnValue({ userId: 'test-admin-id' })
}));

describe('Auth API Tests', () => {
  let app;
  let testAdmin;

  beforeAll(async () => {
    app = createApp();
  });

  beforeEach(async () => {
    // Clean up before each test
    await Admin.deleteMany({});
    
    // Create test admin
    testAdmin = new Admin({
      username: 'testadmin',
      email: 'test@example.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
      isActive: true
    });
    await testAdmin.save();
  });

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testadmin',
          password: 'password'
        })
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('admin');
      expect(response.body.data.admin.username).toBe('testadmin');
    });

    test('should reject invalid username', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'invalid',
          password: 'password'
        })
        .expect(401);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject invalid password', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testadmin',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    test('should reject inactive admin', async () => {
      // Deactivate admin
      await Admin.findByIdAndUpdate(testAdmin._id, { isActive: false });

      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'testadmin',
          password: 'password'
        })
        .expect(401);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('Account is inactive');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({})
        .expect(400);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    test('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /auth/logout', () => {
    test('should logout successfully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });

  describe('GET /auth/me', () => {
    test('should return admin info with valid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer mock-jwt-token')
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('admin');
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .expect(401);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });
});

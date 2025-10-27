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

describe('Admin API Tests', () => {
  let app;
  let testAdmin;
  let authToken;

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
    
    authToken = 'Bearer mock-jwt-token';
  });

  describe('GET /admin/admins', () => {
    test('should return list of admins', async () => {
      const response = await request(app)
        .get('/admin/admins')
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('admins');
      expect(Array.isArray(response.body.data.admins)).toBe(true);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/admin/admins')
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('POST /admin/admins', () => {
    test('should create new admin with valid data', async () => {
      const newAdminData = {
        username: 'newadmin',
        email: 'new@example.com',
        password: 'newpassword123',
        isActive: true
      };

      const response = await request(app)
        .post('/admin/admins')
        .set('Authorization', authToken)
        .send(newAdminData)
        .expect(201);

      expect(response.body.ok).toBe(true);
      expect(response.body.data).toHaveProperty('admin');
      expect(response.body.data.admin.username).toBe('newadmin');
      expect(response.body.data.admin.email).toBe('new@example.com');
    });

    test('should reject duplicate username', async () => {
      const duplicateAdminData = {
        username: 'testadmin', // Already exists
        email: 'duplicate@example.com',
        password: 'password123',
        isActive: true
      };

      const response = await request(app)
        .post('/admin/admins')
        .set('Authorization', authToken)
        .send(duplicateAdminData)
        .expect(400);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should reject duplicate email', async () => {
      const duplicateEmailData = {
        username: 'newadmin2',
        email: 'test@example.com', // Already exists
        password: 'password123',
        isActive: true
      };

      const response = await request(app)
        .post('/admin/admins')
        .set('Authorization', authToken)
        .send(duplicateEmailData)
        .expect(400);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/admin/admins')
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/admin/admins')
        .send({
          username: 'newadmin',
          email: 'new@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('GET /admin/admins/:id', () => {
    test('should return admin by ID', async () => {
      const response = await request(app)
        .get(`/admin/admins/${testAdmin._id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.admin._id).toBe(testAdmin._id.toString());
    });

    test('should return 404 for non-existent admin', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/admin/admins/${fakeId}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.ok).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get(`/admin/admins/${testAdmin._id}`)
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('PUT /admin/admins/:id', () => {
    test('should update admin with valid data', async () => {
      const updateData = {
        username: 'updatedadmin',
        email: 'updated@example.com',
        isActive: false
      };

      const response = await request(app)
        .put(`/admin/admins/${testAdmin._id}`)
        .set('Authorization', authToken)
        .send(updateData)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.data.admin.username).toBe('updatedadmin');
      expect(response.body.data.admin.email).toBe('updated@example.com');
      expect(response.body.data.admin.isActive).toBe(false);
    });

    test('should return 404 for non-existent admin', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/admin/admins/${fakeId}`)
        .set('Authorization', authToken)
        .send({ username: 'updated' })
        .expect(404);

      expect(response.body.ok).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .put(`/admin/admins/${testAdmin._id}`)
        .send({ username: 'updated' })
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });

  describe('DELETE /admin/admins/:id', () => {
    test('should delete admin', async () => {
      const response = await request(app)
        .delete(`/admin/admins/${testAdmin._id}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.ok).toBe(true);
      expect(response.body.message).toContain('deleted successfully');
    });

    test('should return 404 for non-existent admin', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/admin/admins/${fakeId}`)
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.ok).toBe(false);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .delete(`/admin/admins/${testAdmin._id}`)
        .expect(401);

      expect(response.body.ok).toBe(false);
    });
  });
});

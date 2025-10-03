const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { appFactory } = require('./setup');
const { Admin } = require('../src/modules/admin/model');

describe('Auth module', () => {
  let app;

  beforeEach(async () => {
    app = appFactory();
  });

  async function seedAdmin(email = 'admin@example.com', password = 'password123') {
    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.create({ email, passwordHash });
    return { email, password };
  }

  test('POST /auth/login should return token with valid credentials', async () => {
    const { email, password } = await seedAdmin();
    const res = await request(app)
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
  });

  test('POST /auth/login should reject invalid credentials', async () => {
    const { email } = await seedAdmin();
    const res = await request(app)
      .post('/auth/login')
      .send({ email, password: 'wrongpass' })
      .expect(401);

    expect(res.body).toHaveProperty('error');
  });

  test('GET /auth/me should return admin profile with valid token', async () => {
    const { email, password } = await seedAdmin();
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    const token = loginRes.body.token;
    const meRes = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meRes.body).toHaveProperty('admin');
    expect(meRes.body.admin).toHaveProperty('email', email);
    expect(meRes.body.admin).toHaveProperty('id');
  });

  test('GET /auth/me should reject without token', async () => {
    await seedAdmin();
    await request(app)
      .get('/auth/me')
      .expect(401);
  });
});



// Authentication API Integration Tests
// End-to-end testing for authentication endpoints

const { describe, test, expect, beforeAll, afterAll, beforeEach } = require('@jest/globals');
const request = require('supertest');
const app = require('../../src/app');
const { sequelize, Account, Role } = require('../../src/models');
const bcrypt = require('bcryptjs');

describe('Authentication API Integration Tests', () => {
  let server;
  let testUser;
  let studentRole;

  beforeAll(async () => {
    // Ensure database is connected and synced
    await sequelize.sync({ force: true });
    
    // Create test roles
    studentRole = await Role.create({
      role_name: 'student',
      description: 'Student role for testing'
    });

    await Role.create({
      role_name: 'lecturer',
      description: 'Lecturer role for testing'
    });

    await Role.create({
      role_name: 'admin',
      description: 'Admin role for testing'
    });
  });

  beforeEach(async () => {
    // Clean up accounts before each test
    await Account.destroy({ where: {}, force: true });
    
    // Create a test user for login tests
    testUser = await Account.create({
      email: 'testuser@example.com',
      password: await bcrypt.hash('password123', 10),
      first_name: 'Test',
      last_name: 'User',
      role_id: studentRole.id,
      is_active: true
    });
  });

  afterAll(async () => {
    // Clean up database
    await sequelize.close();
  });

  describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe('testuser@example.com');
    });

    test('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    test('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });

    test('should reject inactive user', async () => {
      // Deactivate the test user
      await testUser.update({ is_active: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        })
        .expect(403);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('deactivated');
    });

    test('should validate request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: '123' // Too short
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    test('should handle missing request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken;

    beforeEach(async () => {
      // Get access token for logout tests
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });
      
      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    test('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    test('should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('token');
    });

    test('should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/auth/change-password', () => {
    let accessToken;

    beforeEach(async () => {
      // Get access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });
      
      accessToken = loginResponse.body.data.tokens.accessToken;
    });

    test('should change password successfully', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          current_password: 'password123',
          new_password: 'newpassword456',
          confirm_password: 'newpassword456'
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Password changed successfully');

      // Verify new password works
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'newpassword456'
        })
        .expect(200);

      expect(loginResponse.body.data.user.email).toBe('testuser@example.com');
    });

    test('should reject wrong current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          current_password: 'wrongpassword',
          new_password: 'newpassword456',
          confirm_password: 'newpassword456'
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('current password');
    });

    test('should reject mismatched password confirmation', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          current_password: 'password123',
          new_password: 'newpassword456',
          confirm_password: 'differentpassword'
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('errors');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          current_password: 'password123',
          new_password: 'newpassword456',
          confirm_password: 'newpassword456'
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    test('should send reset token for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'testuser@example.com'
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body.message).toContain('reset link');
    });

    test('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com'
        })
        .expect(200);

      // Should return success for security reasons
      expect(response.body).toHaveProperty('status', 'success');
    });

    test('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let refreshToken;

    beforeEach(async () => {
      // Get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });
      
      refreshToken = loginResponse.body.data.tokens.refreshToken;
    });

    test('should refresh access token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refresh_token: refreshToken
        })
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(typeof response.body.data.accessToken).toBe('string');
    });

    test('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({
          refresh_token: 'invalid-refresh-token'
        })
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Invalid');
    });

    test('should require refresh token in request body', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to login endpoint', async () => {
      const promises = [];
      
      // Make multiple rapid requests
      for (let i = 0; i < 7; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'testuser@example.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Check if at least one request was rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers in responses', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123'
        });

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers['x-frame-options']).toBe('DENY');
    });
  });
});

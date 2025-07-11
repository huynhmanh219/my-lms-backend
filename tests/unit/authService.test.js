// Authentication Service Unit Tests
// Comprehensive testing for authService functions

const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('bcryptjs');
jest.mock('../../src/models');

describe('Authentication Service', () => {
  let authService;
  let mockAccount;
  let mockRole;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock models
    mockAccount = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      save: jest.fn()
    };
    
    mockRole = {
      findOne: jest.fn()
    };
    
    // Mock the models import
    require('../../src/models').Account = mockAccount;
    require('../../src/models').Role = mockRole;
    
    // Import auth service after mocking
    authService = require('../../src/services/authService');
  });

  describe('generateTokens', () => {
    test('should generate valid access and refresh tokens', () => {
      const userData = {
        id: 1,
        email: 'test@example.com',
        role_name: 'student'
      };
      
      jwt.sign.mockReturnValueOnce('mock-access-token');
      jwt.sign.mockReturnValueOnce('mock-refresh-token');
      
      const tokens = authService.generateTokens(userData);
      
      expect(jwt.sign).toHaveBeenCalledTimes(2);
      expect(tokens).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });
    });

    test('should include correct payload in tokens', () => {
      const userData = {
        id: 123,
        email: 'user@test.com',
        role_name: 'lecturer'
      };
      
      authService.generateTokens(userData);
      
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 123,
          email: 'user@test.com',
          role: 'lecturer'
        }),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('verifyToken', () => {
    test('should verify valid token successfully', () => {
      const mockPayload = { id: 1, email: 'test@example.com' };
      jwt.verify.mockReturnValue(mockPayload);
      
      const result = authService.verifyToken('valid-token');
      
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
      expect(result).toEqual(mockPayload);
    });

    test('should throw error for invalid token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      expect(() => {
        authService.verifyToken('invalid-token');
      }).toThrow('Invalid token');
    });

    test('should throw error for expired token', () => {
      jwt.verify.mockImplementation(() => {
        const error = new Error('Token expired');
        error.name = 'TokenExpiredError';
        throw error;
      });
      
      expect(() => {
        authService.verifyToken('expired-token');
      }).toThrow('Token expired');
    });
  });

  describe('hashPassword', () => {
    test('should hash password with correct salt rounds', async () => {
      bcrypt.hash.mockResolvedValue('hashed-password');
      
      const result = await authService.hashPassword('password123');
      
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toBe('hashed-password');
    });

    test('should handle hashing errors', async () => {
      bcrypt.hash.mockRejectedValue(new Error('Hashing failed'));
      
      await expect(authService.hashPassword('password123'))
        .rejects.toThrow('Hashing failed');
    });
  });

  describe('comparePassword', () => {
    test('should return true for matching passwords', async () => {
      bcrypt.compare.mockResolvedValue(true);
      
      const result = await authService.comparePassword('password123', 'hashed-password');
      
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result).toBe(true);
    });

    test('should return false for non-matching passwords', async () => {
      bcrypt.compare.mockResolvedValue(false);
      
      const result = await authService.comparePassword('wrongpassword', 'hashed-password');
      
      expect(result).toBe(false);
    });
  });

  describe('validateUserCredentials', () => {
    test('should validate correct credentials', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        is_active: true,
        Role: { role_name: 'student' }
      };
      
      mockAccount.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      
      const result = await authService.validateUserCredentials('test@example.com', 'password123');
      
      expect(result).toEqual(mockUser);
    });

    test('should reject invalid email', async () => {
      mockAccount.findOne.mockResolvedValue(null);
      
      await expect(authService.validateUserCredentials('invalid@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials');
    });

    test('should reject incorrect password', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        is_active: true
      };
      
      mockAccount.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      
      await expect(authService.validateUserCredentials('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    test('should reject inactive user', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashed-password',
        is_active: false
      };
      
      mockAccount.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      
      await expect(authService.validateUserCredentials('test@example.com', 'password123'))
        .rejects.toThrow('Account is deactivated');
    });
  });

  describe('refreshAccessToken', () => {
    test('should generate new access token from valid refresh token', () => {
      const mockPayload = { id: 1, email: 'test@example.com', role: 'student' };
      jwt.verify.mockReturnValue(mockPayload);
      jwt.sign.mockReturnValue('new-access-token');
      
      const result = authService.refreshAccessToken('valid-refresh-token');
      
      expect(jwt.verify).toHaveBeenCalledWith('valid-refresh-token', process.env.JWT_REFRESH_SECRET);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining(mockPayload),
        process.env.JWT_SECRET,
        expect.any(Object)
      );
      expect(result).toBe('new-access-token');
    });

    test('should throw error for invalid refresh token', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid refresh token');
      });
      
      expect(() => {
        authService.refreshAccessToken('invalid-refresh-token');
      }).toThrow('Invalid refresh token');
    });
  });

  describe('generatePasswordResetToken', () => {
    test('should generate secure reset token', () => {
      const token = authService.generatePasswordResetToken();
      
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(20);
    });

    test('should generate unique tokens', () => {
      const token1 = authService.generatePasswordResetToken();
      const token2 = authService.generatePasswordResetToken();
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('validatePasswordResetToken', () => {
    test('should validate token and return user data', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_reset_token: 'valid-token',
        password_reset_expires: new Date(Date.now() + 3600000)
      };
      
      mockAccount.findOne.mockResolvedValue(mockUser);
      
      const result = await authService.validatePasswordResetToken('valid-token');
      
      expect(result).toEqual(mockUser);
    });

    test('should reject invalid token', async () => {
      mockAccount.findOne.mockResolvedValue(null);
      
      await expect(authService.validatePasswordResetToken('invalid-token'))
        .rejects.toThrow('Invalid or expired reset token');
    });

    test('should reject expired token', async () => {
      const mockUser = {
        id: 1,
        email: 'test@example.com',
        password_reset_token: 'expired-token',
        password_reset_expires: new Date(Date.now() - 3600000)
      };
      
      mockAccount.findOne.mockResolvedValue(mockUser);
      
      await expect(authService.validatePasswordResetToken('expired-token'))
        .rejects.toThrow('Invalid or expired reset token');
    });
  });
});

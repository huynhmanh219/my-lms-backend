// Utility Functions Unit Tests
// Testing helper and utility functions

const { describe, test, expect } = require('@jest/globals');
const helpers = require('../../src/utils/helpers');
const { formatDuration, generateRandomCode, sanitizeFilename, calculatePagination } = helpers;

describe('Utility Helper Functions', () => {
  describe('formatDuration', () => {
    test('should format minutes correctly', () => {
      expect(formatDuration(45)).toBe('45m');
      expect(formatDuration(1)).toBe('1m');
      expect(formatDuration(59)).toBe('59m');
    });

    test('should format hours and minutes correctly', () => {
      expect(formatDuration(60)).toBe('1h 0m');
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(125)).toBe('2h 5m');
    });

    test('should handle zero duration', () => {
      expect(formatDuration(0)).toBe('0m');
    });

    test('should handle invalid input', () => {
      expect(formatDuration(-1)).toBe('0m');
      expect(formatDuration(null)).toBe('0m');
      expect(formatDuration(undefined)).toBe('0m');
      expect(formatDuration('invalid')).toBe('0m');
    });
  });

  describe('generateRandomCode', () => {
    test('should generate code of specified length', () => {
      const code6 = generateRandomCode(6);
      const code10 = generateRandomCode(10);
      
      expect(code6).toHaveLength(6);
      expect(code10).toHaveLength(10);
    });

    test('should generate alphanumeric code', () => {
      const code = generateRandomCode(20);
      expect(code).toMatch(/^[A-Z0-9]+$/);
    });

    test('should generate unique codes', () => {
      const code1 = generateRandomCode(8);
      const code2 = generateRandomCode(8);
      const code3 = generateRandomCode(8);
      
      expect(code1).not.toBe(code2);
      expect(code2).not.toBe(code3);
      expect(code1).not.toBe(code3);
    });

    test('should handle default length', () => {
      const code = generateRandomCode();
      expect(code).toHaveLength(8); // Assuming default is 8
    });
  });

  describe('sanitizeFilename', () => {
    test('should remove invalid characters', () => {
      expect(sanitizeFilename('file<name>')).toBe('filename');
      expect(sanitizeFilename('file|name')).toBe('filename');
      expect(sanitizeFilename('file:name')).toBe('filename');
      expect(sanitizeFilename('file*name')).toBe('filename');
    });

    test('should preserve valid characters', () => {
      expect(sanitizeFilename('valid_file-name.txt')).toBe('valid_file-name.txt');
      expect(sanitizeFilename('File Name (1).pdf')).toBe('File Name (1).pdf');
    });

    test('should handle empty strings', () => {
      expect(sanitizeFilename('')).toBe('untitled');
      expect(sanitizeFilename(null)).toBe('untitled');
      expect(sanitizeFilename(undefined)).toBe('untitled');
    });

    test('should limit filename length', () => {
      const longName = 'a'.repeat(300);
      const sanitized = sanitizeFilename(longName);
      expect(sanitized.length).toBeLessThanOrEqual(255);
    });
  });

  describe('calculatePagination', () => {
    test('should calculate pagination correctly', () => {
      const result = calculatePagination(1, 10, 50);
      
      expect(result).toEqual({
        currentPage: 1,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10,
        hasNextPage: true,
        hasPrevPage: false,
        nextPage: 2,
        prevPage: null
      });
    });

    test('should handle last page correctly', () => {
      const result = calculatePagination(5, 10, 50);
      
      expect(result).toEqual({
        currentPage: 5,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: true,
        nextPage: null,
        prevPage: 4
      });
    });

    test('should handle middle pages correctly', () => {
      const result = calculatePagination(3, 10, 50);
      
      expect(result).toEqual({
        currentPage: 3,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10,
        hasNextPage: true,
        hasPrevPage: true,
        nextPage: 4,
        prevPage: 2
      });
    });

    test('should handle edge cases', () => {
      // No items
      const noItems = calculatePagination(1, 10, 0);
      expect(noItems.totalPages).toBe(0);
      expect(noItems.hasNextPage).toBe(false);

      // Single page
      const singlePage = calculatePagination(1, 10, 5);
      expect(singlePage.totalPages).toBe(1);
      expect(singlePage.hasNextPage).toBe(false);
      expect(singlePage.hasPrevPage).toBe(false);
    });

    test('should validate input parameters', () => {
      // Invalid page number
      const invalidPage = calculatePagination(0, 10, 50);
      expect(invalidPage.currentPage).toBe(1);

      // Invalid limit
      const invalidLimit = calculatePagination(1, 0, 50);
      expect(invalidLimit.itemsPerPage).toBe(10); // Should default to 10
    });
  });

  describe('Error handling utilities', () => {
    test('should create standardized error responses', () => {
      const errorResponse = helpers.createErrorResponse('Validation failed', 400, ['Field is required']);
      
      expect(errorResponse).toEqual({
        status: 'error',
        message: 'Validation failed',
        statusCode: 400,
        errors: ['Field is required'],
        timestamp: expect.any(String)
      });
    });

    test('should create success responses', () => {
      const successResponse = helpers.createSuccessResponse({ id: 1, name: 'Test' }, 'Created successfully');
      
      expect(successResponse).toEqual({
        status: 'success',
        message: 'Created successfully',
        data: { id: 1, name: 'Test' },
        timestamp: expect.any(String)
      });
    });
  });

  describe('Data validation utilities', () => {
    test('should validate email addresses', () => {
      expect(helpers.isValidEmail('test@example.com')).toBe(true);
      expect(helpers.isValidEmail('user+tag@domain.co.uk')).toBe(true);
      expect(helpers.isValidEmail('invalid-email')).toBe(false);
      expect(helpers.isValidEmail('test@')).toBe(false);
      expect(helpers.isValidEmail('')).toBe(false);
    });

    test('should validate phone numbers', () => {
      expect(helpers.isValidPhone('+1234567890')).toBe(true);
      expect(helpers.isValidPhone('(123) 456-7890')).toBe(true);
      expect(helpers.isValidPhone('123-456-7890')).toBe(true);
      expect(helpers.isValidPhone('invalid-phone')).toBe(false);
      expect(helpers.isValidPhone('123')).toBe(false);
    });

    test('should validate student IDs', () => {
      expect(helpers.isValidStudentId('STU12345')).toBe(true);
      expect(helpers.isValidStudentId('2023001')).toBe(true);
      expect(helpers.isValidStudentId('AB')).toBe(false); // Too short
      expect(helpers.isValidStudentId('')).toBe(false);
    });
  });

  describe('Date and time utilities', () => {
    test('should format dates correctly', () => {
      const date = new Date('2023-12-25T10:30:00Z');
      expect(helpers.formatDate(date)).toMatch(/2023-12-25/);
      expect(helpers.formatDateTime(date)).toMatch(/2023-12-25.*10:30/);
    });

    test('should calculate date differences', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-01-08');
      
      expect(helpers.daysBetween(date1, date2)).toBe(7);
      expect(helpers.daysBetween(date2, date1)).toBe(7); // Should return absolute value
    });

    test('should check if date is in range', () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      expect(helpers.isDateInRange(now, yesterday, tomorrow)).toBe(true);
      expect(helpers.isDateInRange(yesterday, now, tomorrow)).toBe(false);
    });
  });
});

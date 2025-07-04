// Test Setup for Jest
// Configures test environment for each test file

const { beforeAll, afterAll, beforeEach, afterEach } = require('@jest/globals');
const path = require('path');
const fs = require('fs');

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error // Keep error messages for debugging
};

// Global test database connection
let testDb;

// Setup before all tests in a file
beforeAll(async () => {
  // Ensure test uploads directory exists
  const testUploadsDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(testUploadsDir)) {
    fs.mkdirSync(testUploadsDir, { recursive: true });
  }
  
  // Initialize test database connection if needed
  try {
    const { sequelize } = require('../../src/models');
    testDb = sequelize;
    
    // Test database connection
    await testDb.authenticate();
    console.error('✅ Test database connection established');
    
    // Sync database (create tables if they don't exist)
    await testDb.sync({ force: false, alter: true });
    console.error('✅ Test database synchronized');
    
  } catch (error) {
    console.error('❌ Test database setup failed:', error.message);
  }
});

// Cleanup after all tests in a file
afterAll(async () => {
  // Close database connection
  if (testDb) {
    await testDb.close();
    console.error('✅ Test database connection closed');
  }
  
  // Clean up any test files created during tests
  const testUploadsDir = path.join(__dirname, '../uploads');
  if (fs.existsSync(testUploadsDir)) {
    const files = fs.readdirSync(testUploadsDir);
    files.forEach(file => {
      const filePath = path.join(testUploadsDir, file);
      if (fs.statSync(filePath).isFile()) {
        fs.unlinkSync(filePath);
      }
    });
  }
});

// Setup before each test
beforeEach(async () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Reset any global state if needed
  process.env.NODE_ENV = 'test';
});

// Cleanup after each test
afterEach(async () => {
  // Clean up any test data created during the test
  // This can be expanded based on specific test needs
});

// Global test utilities
global.testUtils = {
  // Helper to create test users
  createTestUser: async (userData = {}) => {
    const { Account, Role } = require('../../src/models');
    const bcrypt = require('bcryptjs');
    
    const defaultData = {
      email: `test-${Date.now()}@example.com`,
      password: await bcrypt.hash('password123', 10),
      first_name: 'Test',
      last_name: 'User',
      is_active: true
    };
    
    // Get default role
    const studentRole = await Role.findOne({ where: { role_name: 'student' } });
    if (studentRole) {
      defaultData.role_id = studentRole.id;
    }
    
    return await Account.create({ ...defaultData, ...userData });
  },
  
  // Helper to create test JWT tokens
  createTestToken: (payload = {}) => {
    const jwt = require('jsonwebtoken');
    const defaultPayload = {
      id: 1,
      email: 'test@example.com',
      role: 'student'
    };
    
    return jwt.sign(
      { ...defaultPayload, ...payload },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },
  
  // Helper to create test files
  createTestFile: (filename = 'test-file.txt', content = 'test content') => {
    const testUploadsDir = path.join(__dirname, '../uploads');
    const filePath = path.join(testUploadsDir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
  },
  
  // Helper to cleanup test data
  cleanupTestData: async (modelName, whereClause = {}) => {
    try {
      const model = require('../../src/models')[modelName];
      if (model) {
        await model.destroy({ where: whereClause, force: true });
      }
    } catch (error) {
      console.error(`Failed to cleanup ${modelName}:`, error.message);
    }
  }
};

// Export for use in tests
module.exports = {
  testUtils: global.testUtils
};

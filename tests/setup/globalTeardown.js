// Global Test Teardown for LMS Backend
// Cleans up test environment after all tests

const path = require('path');
const fs = require('fs');

module.exports = async () => {
  console.log('\n🧹 Cleaning up test environment...\n');
  
  try {
    // Clean up test uploads directory
    const testUploadsDir = path.join(__dirname, '../../tests/uploads');
    if (fs.existsSync(testUploadsDir)) {
      const files = fs.readdirSync(testUploadsDir);
      files.forEach(file => {
        const filePath = path.join(testUploadsDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
      console.log('✅ Test uploads cleaned up');
    }
    
    // Clear test environment variables
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
    
    console.log('✅ Test environment variables cleared');
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      console.log('✅ Garbage collection completed');
    }
    
    console.log('\n🎉 Test cleanup completed successfully\n');
    
  } catch (error) {
    console.error('❌ Error during test cleanup:', error.message);
  }
};

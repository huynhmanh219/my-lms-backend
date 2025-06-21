// Test Server Entry Point (Without Database)
// This version runs without database connection for testing Express setup

require('dotenv').config();
const app = require('./src/app');

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🧪 Starting LMS Backend in TEST MODE (No Database)');
console.log('📍 This version runs without database connection for testing');

// Start server without database connection
const server = app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📍 Environment: ${NODE_ENV}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
    console.log('\n📋 Available endpoints to test:');
    console.log('   GET  /health                    - Health check');
    console.log('   POST /api/auth/login            - Login (placeholder)');
    console.log('   GET  /api/users/teachers        - Get teachers (placeholder)');
    console.log('   GET  /api/courses               - Get courses (placeholder)');
    console.log('\n⚠️  Note: All API endpoints return placeholder responses until database is configured');
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close(() => {
        console.log('📴 HTTP server closed');
        process.exit(0);
    });
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
}); 
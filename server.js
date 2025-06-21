// Server Entry Point
// Starts the Express server and handles database connection

require('dotenv').config();
const app = require('./src/app');
const sequelize = require('./src/config/database');

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Database connection and server startup
const startServer = async () => {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');

        // Sync database (only in development)
        if (NODE_ENV === 'development') {
            // await sequelize.sync({ force: false });
            console.log('📊 Database synchronized');
        }

        // Start server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${NODE_ENV}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/health`);
        });

        // Graceful shutdown handling
        const gracefulShutdown = (signal) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);
            
            server.close(() => {
                console.log('📴 HTTP server closed');
                
                sequelize.close().then(() => {
                    console.log('📴 Database connection closed');
                    process.exit(0);
                }).catch((err) => {
                    console.error('❌ Error closing database connection:', err);
                    process.exit(1);
                });
            });
        };

        // Handle shutdown signals
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
});

// Start the server
startServer(); 
// Database Connection Test
// Run this script to test your MySQL connection

require('dotenv').config();
const mysql = require('mysql2/promise');

const testConnection = async () => {
    console.log('🔍 Testing MySQL database connection...\n');

    // Configuration from environment
    const config = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lms_database'
    };

    console.log('📋 Database Configuration:');
    console.log(`   Host: ${config.host}`);
    console.log(`   Port: ${config.port}`);
    console.log(`   User: ${config.user}`);
    console.log(`   Password: ${config.password ? '***set***' : '***not set***'}`);
    console.log(`   Database: ${config.database}\n`);

    try {
        // Test connection without database first
        console.log('🔌 Testing MySQL server connection...');
        const serverConnection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });
        
        console.log('✅ MySQL server connection successful!');
        
        // Check if database exists
        console.log('🔍 Checking if database exists...');
        const [databases] = await serverConnection.query(
            'SHOW DATABASES LIKE ?', 
            [config.database]
        );
        
        if (databases.length === 0) {
            console.log('❌ Database does not exist. Creating...');
            await serverConnection.query(`CREATE DATABASE ${config.database}`);
            console.log('✅ Database created successfully!');
        } else {
            console.log('✅ Database already exists!');
        }
        
        await serverConnection.end();
        
        // Test connection with database
        console.log('🔌 Testing database connection...');
        const dbConnection = await mysql.createConnection(config);
        console.log('✅ Database connection successful!');
        
        // Test creating a simple table
        console.log('🛠️  Testing table creation...');
        await dbConnection.query(`
            CREATE TABLE IF NOT EXISTS connection_test (
                id INT AUTO_INCREMENT PRIMARY KEY,
                test_message VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Insert test data
        await dbConnection.query(
            'INSERT INTO connection_test (test_message) VALUES (?)',
            ['Database connection test successful!']
        );
        
        // Read test data
        const [rows] = await dbConnection.query(
            'SELECT * FROM connection_test ORDER BY id DESC LIMIT 1'
        );
        
        console.log('✅ Test table operations successful!');
        console.log('📄 Test data:', rows[0]);
        
        // Clean up test table
        await dbConnection.query('DROP TABLE connection_test');
        console.log('🧹 Test cleanup completed!');
        
        await dbConnection.end();
        
        console.log('\n🎉 Database setup is working correctly!');
        console.log('📋 Next steps:');
        console.log('   1. Run: npm run db:setup    (create tables)');
        console.log('   2. Run: npm run db:seed     (seed initial data)');
        console.log('   3. Run: npm run dev         (start server)');
        
    } catch (error) {
        console.error('\n❌ Database connection failed!');
        console.error('Error:', error.message);
        console.log('\n🔧 Troubleshooting:');
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('   • Wrong username or password');
            console.log('   • Update your .env file with correct credentials');
            console.log('   • Try running: mysql -u root -p');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   • MySQL server is not running');
            console.log('   • Start MySQL service:');
            console.log('     Windows: net start mysql');
            console.log('     macOS: brew services start mysql');
            console.log('     Linux: sudo systemctl start mysql');
        } else if (error.code === 'ENOTFOUND') {
            console.log('   • Wrong hostname in .env file');
            console.log('   • Check DB_HOST setting');
        } else {
            console.log('   • Check MySQL installation and configuration');
            console.log('   • Verify credentials in .env file');
        }
        
        process.exit(1);
    }
};

// Run test
if (require.main === module) {
    testConnection();
}

module.exports = testConnection; 
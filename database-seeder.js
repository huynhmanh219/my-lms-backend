// Database Seeder
// Populates initial data for development and testing

require('dotenv').config();
const { sequelize, Role, Account, Lecturer, Student } = require('./src/models');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established');

        // Sync all models (create tables)
        await sequelize.sync({ force: false });
        console.log('📊 Database tables synchronized');

        // Check if roles already exist
        const existingRoles = await Role.count();
        if (existingRoles > 0) {
            console.log('🔄 Roles already exist, skipping seeding');
            return;
        }

        // Seed roles
        console.log('🔑 Seeding roles...');
        const roles = await Role.bulkCreate([
            {
                name: 'admin',
                description: 'System Administrator with full access',
                permissions: ['all']
            },
            {
                name: 'lecturer', 
                description: 'Teacher/Instructor with course management access',
                permissions: ['courses', 'students', 'quizzes', 'materials']
            },
            {
                name: 'student',
                description: 'Student with learning access',
                permissions: ['view_courses', 'take_quizzes', 'view_materials']
            }
        ]);
        console.log(`✅ Created ${roles.length} roles`);

        // Create default admin account
        console.log('👤 Creating default admin account...');
        const adminRole = await Role.findOne({ where: { name: 'admin' } });
        const adminAccount = await Account.create({
            email: 'admin@lms.com',
            password: 'admin123', // Will be hashed by model hook
            role_id: adminRole.id,
            is_active: true,
            email_verified: true
        });

        // Create admin lecturer profile
        await Lecturer.create({
            account_id: adminAccount.id,
            first_name: 'System',
            last_name: 'Administrator',
            title: 'Admin',
            department: 'IT',
            bio: 'System administrator account for LMS management',
            status: 'active'
        });
        console.log('✅ Admin account created (admin@lms.com / admin123)');

        // Create sample lecturer account
        console.log('👨‍🏫 Creating sample lecturer account...');
        const lecturerRole = await Role.findOne({ where: { name: 'lecturer' } });
        const lecturerAccount = await Account.create({
            email: 'lecturer@lms.com',
            password: 'lecturer123',
            role_id: lecturerRole.id,
            is_active: true,
            email_verified: true
        });

        await Lecturer.create({
            account_id: lecturerAccount.id,
            first_name: 'John',
            last_name: 'Smith',
            title: 'Professor',
            department: 'Computer Science',
            bio: 'Sample lecturer account for testing',
            status: 'active'
        });
        console.log('✅ Lecturer account created (lecturer@lms.com / lecturer123)');

        // Create sample student account
        console.log('👨‍🎓 Creating sample student account...');
        const studentRole = await Role.findOne({ where: { name: 'student' } });
        const studentAccount = await Account.create({
            email: 'student@lms.com',
            password: 'student123',
            role_id: studentRole.id,
            is_active: true,
            email_verified: true
        });

        await Student.create({
            account_id: studentAccount.id,
            student_id: 'STU001',
            first_name: 'Jane',
            last_name: 'Doe',
            phone: '123-456-7890',
            address: '123 Student St, University City',
            status: 'active'
        });
        console.log('✅ Student account created (student@lms.com / student123)');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Default Accounts Created:');
        console.log('   Admin:    admin@lms.com    / admin123');
        console.log('   Lecturer: lecturer@lms.com / lecturer123');
        console.log('   Student:  student@lms.com  / student123');
        console.log('\n🚀 You can now start the server with: npm run dev');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

// Run seeder
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase; 
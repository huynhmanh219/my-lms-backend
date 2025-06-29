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

        // Create additional sample teachers
        console.log('👨‍🏫 Creating additional sample teachers...');
        const additionalTeachers = [
            {
                email: 'nguyen.van.a@lms.com',
                password: 'teacher123',
                first_name: 'Nguyễn Văn',
                last_name: 'A',
                title: 'Associate Professor',
                department: 'Mathematics',
                bio: 'Chuyên gia về Toán cao cấp và Giải tích',
                phone: '0901234567'
            },
            {
                email: 'tran.thi.b@lms.com',
                password: 'teacher123',
                first_name: 'Trần Thị',
                last_name: 'B',
                title: 'Lecturer',
                department: 'Physics',
                bio: 'Giảng viên Vật lý và Cơ học',
                phone: '0902345678'
            },
            {
                email: 'le.hoang.c@lms.com',
                password: 'teacher123',
                first_name: 'Lê Hoàng',
                last_name: 'C',
                title: 'Professor',
                department: 'Chemistry',
                bio: 'Tiến sĩ Hóa học, chuyên gia về Hóa hữu cơ',
                phone: '0903456789'
            },
            {
                email: 'pham.minh.d@lms.com',
                password: 'teacher123',
                first_name: 'Phạm Minh',
                last_name: 'D',
                title: 'Assistant Professor',
                department: 'Computer Science',
                bio: 'Chuyên gia về AI và Machine Learning',
                phone: '0904567890'
            },
            {
                email: 'vo.thu.e@lms.com',
                password: 'teacher123',
                first_name: 'Võ Thu',
                last_name: 'E',
                title: 'Lecturer',
                department: 'English Literature',
                bio: 'Thạc sĩ Ngữ văn Anh, giảng viên Văn học',
                phone: '0905678901'
            },
            {
                email: 'dao.van.f@lms.com',
                password: 'teacher123',
                first_name: 'Đào Văn',
                last_name: 'F',
                title: 'Associate Professor',
                department: 'Economics',
                bio: 'Tiến sĩ Kinh tế, chuyên gia về Tài chính',
                phone: '0906789012'
            },
            {
                email: 'bui.thi.g@lms.com',
                password: 'teacher123',
                first_name: 'Bùi Thị',
                last_name: 'G',
                title: 'Professor',
                department: 'Biology',
                bio: 'Giáo sư Sinh học, nghiên cứu về Di truyền học',
                phone: '0907890123'
            },
            {
                email: 'hoang.van.h@lms.com',
                password: 'teacher123',
                first_name: 'Hoàng Văn',
                last_name: 'H',
                title: 'Lecturer',
                department: 'History',
                bio: 'Thạc sĩ Lịch sử, chuyên về Lịch sử Việt Nam',
                phone: '0908901234'
            }
        ];

        // Create accounts and lecturer profiles for additional teachers
        for (const teacherData of additionalTeachers) {
            const teacherAccount = await Account.create({
                email: teacherData.email,
                password: teacherData.password,
                role_id: lecturerRole.id,
                is_active: true,
                email_verified: true
            });

            await Lecturer.create({
                account_id: teacherAccount.id,
                first_name: teacherData.first_name,
                last_name: teacherData.last_name,
                title: teacherData.title,
                department: teacherData.department,
                bio: teacherData.bio,
                phone: teacherData.phone,
                status: 'active'
            });
        }
        console.log(`✅ Created ${additionalTeachers.length} additional teachers`);

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
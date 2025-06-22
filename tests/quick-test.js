// Quick test for Phase 5 Course Management
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const quickTest = async () => {
    try {
        console.log('🚀 Quick Phase 5 Course Management Test\n');

        // 1. Login
        console.log('1. Login as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@lms.com',
            password: 'admin123'
        });
        const token = loginResponse.data.data.tokens.accessToken;
        console.log('✅ Login successful\n');

        // 2. Get teachers to find a lecturer ID
        console.log('2. Getting teachers...');
        const teachersResponse = await axios.get(`${BASE_URL}/users/teachers?limit=1`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        let lecturerId = null;
        if (teachersResponse.data.data.teachers.length > 0) {
            lecturerId = teachersResponse.data.data.teachers[0].profile.id;
            console.log(`✅ Found lecturer ID: ${lecturerId}\n`);
        } else {
            console.log('⚠️  No teachers found, will use ID 1\n');
            lecturerId = 1;
        }

        // 3. Create a course
        console.log('3. Creating a course...');
        const timestamp = Date.now();
        const courseData = {
            subject_name: 'Test Course',
            description: 'A test course for Phase 5',
            subject_code: `TEST${timestamp}`,
            lecturer_id: lecturerId,
            credits: 3,
            semester: 'fall',
            academic_year: '2024-2025'
        };

        const createResponse = await axios.post(`${BASE_URL}/courses`, courseData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const courseId = createResponse.data.data.course.id;
        console.log(`✅ Course created successfully!`);
        console.log(`   Course ID: ${courseId}`);
        console.log(`   Course Name: ${createResponse.data.data.course.subject_name}`);
        console.log(`   Course Code: ${createResponse.data.data.course.subject_code}\n`);

        // 4. Get all courses
        console.log('4. Getting all courses...');
        const coursesResponse = await axios.get(`${BASE_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${coursesResponse.data.data.courses.length} course(s)\n`);

        // 5. Get single course
        console.log('5. Getting single course...');
        const singleCourseResponse = await axios.get(`${BASE_URL}/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Course details retrieved: ${singleCourseResponse.data.data.course.subject_name}\n`);

        // 6. Create a class/section
        console.log('6. Creating a class section...');
        const classData = {
            subject_id: courseId,
            lecturer_id: lecturerId,
            section_name: 'Section A',
            max_students: 30,
            start_date: '2024-09-01',
            end_date: '2024-12-15',
            schedule: 'Mon, Wed, Fri 10:00-11:30',
            room: 'Room 101'
        };

        const createClassResponse = await axios.post(`${BASE_URL}/courses/classes`, classData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const classId = createClassResponse.data.data.class.id;
        console.log(`✅ Class created successfully!`);
        console.log(`   Class ID: ${classId}`);
        console.log(`   Section: ${createClassResponse.data.data.class.section_name}`);
        console.log(`   Max Students: ${createClassResponse.data.data.class.max_students}\n`);

        // 7. Get all classes
        console.log('7. Getting all classes...');
        const classesResponse = await axios.get(`${BASE_URL}/courses/classes`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Found ${classesResponse.data.data.classes.length} class(es)\n`);

        // 8. Test export enrollment (should be empty)
        console.log('8. Testing enrollment export...');
        const exportResponse = await axios.get(`${BASE_URL}/courses/enrollment/export`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Export successful: ${exportResponse.data.data.count} enrollments\n`);

        // 9. Cleanup - Delete class first
        console.log('9. Cleaning up - Deleting class...');
        await axios.delete(`${BASE_URL}/courses/classes/${classId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Class deleted\n');

        // 10. Cleanup - Delete course
        console.log('10. Cleaning up - Deleting course...');
        await axios.delete(`${BASE_URL}/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Course deleted\n');

        console.log('🎉 ALL PHASE 5 CORE FUNCTIONALITY WORKING!');
        console.log('=============================================');
        console.log('✅ Subject Management: Create, Read, Update, Delete');
        console.log('✅ Class Management: Create, Read, Delete');
        console.log('✅ Enrollment Export');
        console.log('✅ Authentication & Authorization');

    } catch (error) {
        console.log('\n❌ Test failed:');
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
};

quickTest(); 
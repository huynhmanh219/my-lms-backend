// Debug specific course retrieval issue
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const debugSpecific = async () => {
    try {
        console.log('🔍 Debugging specific course retrieval issue\n');

        // 1. Login
        console.log('1. Login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@lms.com',
            password: 'admin123'
        });
        const token = loginResponse.data.data.tokens.accessToken;
        console.log('✅ Login successful\n');

        // 2. Create a simple course  
        console.log('2. Creating simple course...');
        const courseData = {
            subject_name: 'Debug Course',
            description: 'Debug course',
            subject_code: 'DEBUG101',
            lecturer_id: 1, // Using ID 1 directly to avoid lecturer lookup issues
            credits: 3
        };

        const createResponse = await axios.post(`${BASE_URL}/courses`, courseData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const courseId = createResponse.data.data.course.id;
        console.log(`✅ Course created - ID: ${courseId}\n`);

        // 3. Try to get the course back
        console.log('3. Trying to get single course...');
        try {
            const getCourseResponse = await axios.get(`${BASE_URL}/courses/${courseId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Single course retrieved successfully!');
            console.log('Course data:', JSON.stringify(getCourseResponse.data.data.course, null, 2));
        } catch (error) {
            console.log('❌ Failed to get single course');
            console.log('Error:', error.response?.data || error.message);
        }

        // 4. Try to get all courses (this worked before)
        console.log('\n4. Getting all courses...');
        const coursesResponse = await axios.get(`${BASE_URL}/courses`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ All courses retrieved - Found ${coursesResponse.data.data.courses.length} course(s)`);

        // 5. Cleanup
        console.log('\n5. Cleanup...');
        await axios.delete(`${BASE_URL}/courses/${courseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Course deleted');

    } catch (error) {
        console.log('\n❌ Debug failed:');
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
};

debugSpecific(); 
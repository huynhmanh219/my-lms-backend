// Debug script to check course API responses
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const debug = async () => {
    try {
        console.log('🔍 Debugging Course API responses...\n');

        // 1. Login as admin
        console.log('1. Logging in as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@lms.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.tokens.accessToken;
        console.log('✅ Login successful\n');

        // 2. Test get courses endpoint
        console.log('2. Testing GET /courses...');
        try {
            const coursesResponse = await axios.get(`${BASE_URL}/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ GET /courses successful');
            console.log('Response status:', coursesResponse.status);
            console.log('Response structure:', JSON.stringify(coursesResponse.data, null, 2));
        } catch (error) {
            console.log('❌ GET /courses failed');
            console.log('Error status:', error.response?.status);
            console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
        }
        console.log('');

        // 3. Test get classes endpoint
        console.log('3. Testing GET /courses/classes...');
        try {
            const classesResponse = await axios.get(`${BASE_URL}/courses/classes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ GET /courses/classes successful');
            console.log('Response status:', classesResponse.status);
            console.log('Response structure:', JSON.stringify(classesResponse.data, null, 2));
        } catch (error) {
            console.log('❌ GET /courses/classes failed');
            console.log('Error status:', error.response?.status);
            console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
        }
        console.log('');

        // 4. Check teacher data
        console.log('4. Checking available teachers...');
        try {
            const teachersResponse = await axios.get(`${BASE_URL}/users/teachers?limit=1`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ GET teachers successful');
            console.log('Teachers found:', teachersResponse.data.data.teachers?.length || 0);
            if (teachersResponse.data.data.teachers?.length > 0) {
                console.log('First teacher:', JSON.stringify(teachersResponse.data.data.teachers[0], null, 2));
            }
        } catch (error) {
            console.log('❌ GET teachers failed');
            console.log('Error:', error.message);
        }

    } catch (error) {
        console.log('❌ Debug failed:', error.message);
    }
};

debug(); 
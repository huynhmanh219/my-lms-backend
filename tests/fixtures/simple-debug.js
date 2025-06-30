// Simple debug script with better error handling
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const debug = async () => {
    console.log('🔍 Starting debug...');

    try {
        // Test 1: Login
        console.log('\n1. Testing login...');
        const loginData = {
            email: 'admin@lms.com',
            password: 'admin123'
        };
        console.log('Login data:', loginData);
        
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
        console.log('✅ Login successful');
        console.log('Login response status:', loginResponse.status);
        
        const token = loginResponse.data?.data?.tokens?.accessToken;
        if (!token) {
            console.log('❌ No token in response');
            console.log('Login response:', JSON.stringify(loginResponse.data, null, 2));
            return;
        }
        console.log('✅ Token obtained');

        // Test 2: Get courses
        console.log('\n2. Testing GET /courses...');
        const coursesResponse = await axios.get(`${BASE_URL}/courses`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ GET courses successful');
        console.log('Courses response status:', coursesResponse.status);
        console.log('Courses response data:', JSON.stringify(coursesResponse.data, null, 2));

    } catch (error) {
        console.log('\n❌ Error occurred:');
        console.log('Message:', error.message);
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Headers:', error.response.headers);
            console.log('Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('Request made but no response received');
            console.log('Request:', error.request);
        } else {
            console.log('Error setting up request:', error.message);
        }
        console.log('Full error:', error);
    }
};

debug().catch(console.error); 
// Debug script for User Management APIs
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const debugTest = async () => {
    try {
        console.log('🔍 Debugging User Management APIs...\n');
        
        // Step 1: Login as admin
        console.log('1. Testing admin login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@lms.com',
            password: 'admin123'
        });
        
        const token = loginResponse.data.data.tokens.accessToken;
        console.log('✅ Login successful, token received');
        
        // Step 2: Test roles endpoint
        console.log('\n2. Testing roles endpoint...');
        try {
            const rolesResponse = await axios.get(`${BASE_URL}/users/roles`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Roles response:', JSON.stringify(rolesResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Roles failed:', error.response?.data || error.message);
        }
        
        // Step 3: Test teachers endpoint
        console.log('\n3. Testing teachers endpoint...');
        try {
            const teachersResponse = await axios.get(`${BASE_URL}/users/teachers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Teachers response:', JSON.stringify(teachersResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Teachers failed:', error.response?.data || error.message);
        }
        
        // Step 4: Test teacher creation
        console.log('\n4. Testing teacher creation...');
        try {
            const createResponse = await axios.post(`${BASE_URL}/users/teachers`, {
                email: 'debug-teacher@test.com',
                password: 'password123',
                first_name: 'Debug',
                last_name: 'Teacher',
                title: 'Debug Professor',
                department: 'Testing'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Teacher creation response:', JSON.stringify(createResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Teacher creation failed:', error.response?.data || error.message);
        }
        
        // Step 5: Test export endpoint
        console.log('\n5. Testing export endpoint...');
        try {
            const exportResponse = await axios.get(`${BASE_URL}/users/teachers/export-excel`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Export response:', JSON.stringify(exportResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Export failed:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.log('❌ General error:', error.message);
        if (error.response) {
            console.log('Response data:', error.response.data);
        }
    }
};

debugTest(); 
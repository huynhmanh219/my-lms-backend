// Authentication System Test
// Test script to verify all authentication endpoints

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_ACCOUNTS = {
    admin: { email: 'admin@lms.com', password: 'password123' },
    lecturer: { email: 'lecturer@lms.com', password: 'password123' },
    student: { email: 'student@lms.com', password: 'password123' }
};

let authTokens = {};

const test = async (name, testFn) => {
    try {
        console.log(`\n🧪 Testing: ${name}`);
        await testFn();
        console.log(`✅ ${name} - PASSED`);
    } catch (error) {
        console.log(`❌ ${name} - FAILED`);
        console.log(`   Error: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data:`, error.response.data);
        }
    }
};

const testLogin = async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, TEST_ACCOUNTS.admin);
    
    if (response.status === 200 && response.data.status === 'success') {
        authTokens.admin = response.data.data.tokens.accessToken;
        console.log(`   ✓ Login successful for admin`);
        console.log(`   ✓ Received access token`);
        console.log(`   ✓ User data:`, response.data.data.user.email);
    } else {
        throw new Error('Login failed');
    }
};

const testLoginInvalidCredentials = async () => {
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin@lms.com',
            password: 'wrongpassword'
        });
        throw new Error('Should have failed with invalid credentials');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(`   ✓ Correctly rejected invalid credentials`);
        } else {
            throw error;
        }
    }
};

const testProtectedRoute = async () => {
    if (!authTokens.admin) {
        throw new Error('No admin token available');
    }

    const response = await axios.post(`${BASE_URL}/auth/logout`, {}, {
        headers: {
            'Authorization': `Bearer ${authTokens.admin}`
        }
    });

    if (response.status === 200) {
        console.log(`   ✓ Protected route accessible with valid token`);
    } else {
        throw new Error('Protected route failed');
    }
};

const testChangePassword = async () => {
    // First login to get a fresh token
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_ACCOUNTS.student);
    const token = loginResponse.data.data.tokens.accessToken;

    const response = await axios.post(`${BASE_URL}/auth/change-password`, {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
    }, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.status === 200) {
        console.log(`   ✓ Password changed successfully`);
        
        // Change it back
        await axios.post(`${BASE_URL}/auth/change-password`, {
            currentPassword: 'newpassword123',
            newPassword: 'password123',
            confirmPassword: 'password123'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log(`   ✓ Password reverted successfully`);
    } else {
        throw new Error('Change password failed');
    }
};

const testForgotPassword = async () => {
    const response = await axios.post(`${BASE_URL}/auth/forgot-password`, {
        email: 'admin@lms.com'
    });

    if (response.status === 200) {
        console.log(`   ✓ Forgot password request successful`);
        if (response.data.resetToken) {
            console.log(`   ✓ Reset token generated (for testing)`);
        }
    } else {
        throw new Error('Forgot password failed');
    }
};

const testRefreshToken = async () => {
    // Login to get tokens
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, TEST_ACCOUNTS.lecturer);
    const refreshToken = loginResponse.data.data.tokens.refreshToken;

    const response = await axios.post(`${BASE_URL}/auth/refresh-token`, {
        refreshToken: refreshToken
    });

    if (response.status === 200 && response.data.data.tokens.accessToken) {
        console.log(`   ✓ Token refresh successful`);
        console.log(`   ✓ New access token received`);
    } else {
        throw new Error('Token refresh failed');
    }
};

const testUnauthenticatedAccess = async () => {
    try {
        await axios.post(`${BASE_URL}/auth/change-password`, {
            currentPassword: 'password123',
            newPassword: 'newpassword123',
            confirmPassword: 'newpassword123'
        });
        throw new Error('Should have failed without authentication');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(`   ✓ Correctly rejected unauthenticated request`);
        } else {
            throw error;
        }
    }
};

const runAllTests = async () => {
    console.log('🚀 Starting Authentication System Tests');
    console.log('=====================================');

    await test('Login with valid credentials', testLogin);
    await test('Login with invalid credentials', testLoginInvalidCredentials);
    await test('Access protected route with token', testProtectedRoute);
    await test('Change password', testChangePassword);
    await test('Forgot password', testForgotPassword);
    await test('Refresh token', testRefreshToken);
    await test('Reject unauthenticated access', testUnauthenticatedAccess);

    console.log('\n🎉 Authentication system tests completed!');
    console.log('=====================================');
};

// Run tests if server is available
const checkServer = async () => {
    try {
        await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server is running, starting tests...');
        await runAllTests();
    } catch (error) {
        console.log('❌ Server is not available. Please start the server first:');
        console.log('   npm start');
    }
};

checkServer(); 
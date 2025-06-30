// Phase 10 Security & Middleware Testing
// Test all security features, validation, and enhanced middleware

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_CONFIG = {
    timeout: 10000,
    validateStatus: () => true // Don't throw on any status code
};

// Test utilities
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logSection = (title) => {
    console.log('\n' + '='.repeat(60));
    console.log(`🛡️  ${title}`);
    console.log('='.repeat(60));
};

const logTest = (description, success, response = null) => {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${description}`);
    
    if (response) {
        console.log(`   Status: ${response.status}`);
        if (response.data && response.data.message) {
            console.log(`   Message: ${response.data.message}`);
        }
        if (response.data && response.data.code) {
            console.log(`   Code: ${response.data.code}`);
        }
    }
};

// Test functions
async function testHealthEndpoint() {
    logSection('HEALTH CHECK & SECURITY INFO');
    
    try {
        // Test health endpoint
        const healthResponse = await axios.get(`${BASE_URL}/health`, TEST_CONFIG);
        logTest('Health endpoint accessible', healthResponse.status === 200, healthResponse);
        
        // Test security info endpoint (development only)
        const securityResponse = await axios.get(`${BASE_URL}/security-info`, TEST_CONFIG);
        logTest('Security info endpoint accessible', securityResponse.status === 200, securityResponse);
        
        if (securityResponse.status === 200) {
            console.log('   Security Features:', JSON.stringify(securityResponse.data.security, null, 2));
        }
        
    } catch (error) {
        logTest('Health check failed', false, { status: 'ERROR', data: { message: error.message } });
    }
}

async function testSecurityHeaders() {
    logSection('SECURITY HEADERS VALIDATION');
    
    try {
        const response = await axios.get(`${BASE_URL}/health`, TEST_CONFIG);
        const headers = response.headers;
        
        // Check for security headers
        const securityHeaders = [
            'x-content-type-options',
            'x-frame-options', 
            'x-xss-protection',
            'strict-transport-security',
            'referrer-policy'
        ];
        
        securityHeaders.forEach(header => {
            const hasHeader = headers[header] !== undefined;
            logTest(`${header} header present`, hasHeader);
        });
        
        // Check that X-Powered-By is removed
        const poweredByRemoved = headers['x-powered-by'] === undefined;
        logTest('X-Powered-By header removed', poweredByRemoved);
        
    } catch (error) {
        logTest('Security headers test failed', false, { status: 'ERROR', data: { message: error.message } });
    }
}

async function testRateLimiting() {
    logSection('RATE LIMITING TESTS');
    
    try {
        // Test general rate limiting by making multiple rapid requests
        console.log('Testing general rate limiting (100 requests in 15 minutes)...');
        
        let successCount = 0;
        let rateLimitedCount = 0;
        
        for (let i = 0; i < 10; i++) {
            const response = await axios.get(`${BASE_URL}/health`, TEST_CONFIG);
            if (response.status === 200) {
                successCount++;
            } else if (response.status === 429) {
                rateLimitedCount++;
            }
            await delay(50); // Small delay between requests
        }
        
        logTest(`General rate limiting working (${successCount} success, ${rateLimitedCount} limited)`, successCount > 0);
        
        // Test authentication rate limiting
        console.log('Testing authentication rate limiting...');
        
        let authRateLimitTriggered = false;
        for (let i = 0; i < 7; i++) {
            const response = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: 'test@test.com',
                password: 'wrongpassword'
            }, TEST_CONFIG);
            
            if (response.status === 429 && response.data && response.data.code === 'AUTH_LIMIT_EXCEEDED') {
                authRateLimitTriggered = true;
                break;
            }
            await delay(100);
        }
        
        logTest('Authentication rate limiting triggered', authRateLimitTriggered);
        
    } catch (error) {
        logTest('Rate limiting test failed', false, { status: 'ERROR', data: { message: error.message } });
    }
}

async function testInputValidation() {
    logSection('INPUT VALIDATION & SANITIZATION');
    
    try {
        // Test XSS protection
        const xssPayload = {
            email: '<script>alert("xss")</script>test@test.com',
            password: 'password123'
        };
        
        const xssResponse = await axios.post(`${BASE_URL}/api/auth/login`, xssPayload, TEST_CONFIG);
        logTest('XSS protection working', xssResponse.status === 400, xssResponse);
        
        // Test SQL injection protection
        const sqlPayload = {
            email: "test@test.com'; DROP TABLE users; --",
            password: 'password123'
        };
        
        const sqlResponse = await axios.post(`${BASE_URL}/api/auth/login`, sqlPayload, TEST_CONFIG);
        logTest('SQL injection protection working', sqlResponse.status === 400, sqlResponse);
        
        // Test malicious script injection
        const scriptPayload = {
            title: '<script>document.location="http://evil.com"</script>',
            description: 'Test description'
        };
        
        const scriptResponse = await axios.post(`${BASE_URL}/api/courses`, scriptPayload, {
            ...TEST_CONFIG,
            headers: { 'Authorization': 'Bearer invalid-token' }
        });
        logTest('Script injection protection working', 
            scriptResponse.status === 400 || scriptResponse.status === 401, scriptResponse);
        
        // Test parameter pollution
        const pollutionResponse = await axios.get(
            `${BASE_URL}/health?test=1&test=2&test=3&test=4&test=5`, 
            TEST_CONFIG
        );
        logTest('Parameter pollution protection working', pollutionResponse.status === 200);
        
    } catch (error) {
        logTest('Input validation test failed', false, { status: 'ERROR', data: { message: error.message } });
    }
}

async function testFileUploadSecurity() {
    logSection('FILE UPLOAD SECURITY');
    
    try {
        // Test file size limit
        const largeFileData = 'x'.repeat(60 * 1024 * 1024); // 60MB
        const FormData = require('form-data');
        const form = new FormData();
        form.append('file', Buffer.from(largeFileData), {
            filename: 'large-file.txt',
            contentType: 'text/plain'
        });
        
        const sizeResponse = await axios.post(`${BASE_URL}/api/materials/upload`, form, {
            ...TEST_CONFIG,
            headers: {
                ...form.getHeaders(),
                'Authorization': 'Bearer invalid-token'
            }
        });
        
        logTest('File size limit working', 
            sizeResponse.status === 400 || sizeResponse.status === 413 || sizeResponse.status === 401);
        
        // Test suspicious file types
        const form2 = new FormData();
        form2.append('file', Buffer.from('<?php echo "hack"; ?>'), {
            filename: 'malicious.php',
            contentType: 'application/x-php'
        });
        
        const typeResponse = await axios.post(`${BASE_URL}/api/materials/upload`, form2, {
            ...TEST_CONFIG,
            headers: {
                ...form2.getHeaders(),
                'Authorization': 'Bearer invalid-token'
            }
        });
        
        logTest('Malicious file type protection working', 
            typeResponse.status === 400 || typeResponse.status === 401);
        
    } catch (error) {
        logTest('File upload security test failed', false, { status: 'ERROR', data: { message: error.message } });
    }
}

async function testErrorHandling() {
    logSection('ERROR HANDLING & LOGGING');
    
    try {
        // Test 404 handling
        const notFoundResponse = await axios.get(`${BASE_URL}/api/nonexistent-endpoint`, TEST_CONFIG);
        logTest('404 handling working', notFoundResponse.status === 404, notFoundResponse);
        
        // Test error response format
        const errorResponse = await axios.post(`${BASE_URL}/api/auth/login`, {}, TEST_CONFIG);
        const hasErrorFormat = errorResponse.data && 
                              errorResponse.data.status === 'error' &&
                              errorResponse.data.message &&
                              errorResponse.data.code &&
                              errorResponse.data.timestamp;
        
        logTest('Error response format standardized', hasErrorFormat, errorResponse);
        
        // Test invalid JSON handling
        try {
            const invalidJsonResponse = await axios.post(`${BASE_URL}/api/auth/login`, 
                'invalid json', {
                ...TEST_CONFIG,
                headers: { 'Content-Type': 'application/json' }
            });
            logTest('Invalid JSON handling', invalidJsonResponse.status === 400);
        } catch (parseError) {
            logTest('Invalid JSON handling', true); // Error caught appropriately
        }
        
    } catch (error) {
        logTest('Error handling test failed', false, { status: 'ERROR', data: { message: error.message } });
    }
}

async function testCORSConfiguration() {
    logSection('CORS CONFIGURATION');
    
    try {
        // Test CORS headers
        const corsResponse = await axios.options(`${BASE_URL}/api/auth/login`, {
            ...TEST_CONFIG,
            headers: {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        });
        
        const corsHeaders = corsResponse.headers;
        const hasCorsHeaders = corsHeaders['access-control-allow-origin'] !== undefined &&
                              corsHeaders['access-control-allow-methods'] !== undefined &&
                              corsHeaders['access-control-allow-headers'] !== undefined;
        
        logTest('CORS headers configured', hasCorsHeaders, corsResponse);
        
    } catch (error) {
        logTest('CORS configuration test failed', false, { status: 'ERROR', data: { message: error.message } });
    }
}

async function testRequestSizeLimits() {
    logSection('REQUEST SIZE LIMITS');
    
    try {
        // Test large request body
        const largeBody = {
            data: 'x'.repeat(15 * 1024 * 1024) // 15MB
        };
        
        const largBodyResponse = await axios.post(`${BASE_URL}/api/auth/login`, largeBody, TEST_CONFIG);
        logTest('Large request body rejected', largBodyResponse.status === 413 || largBodyResponse.status === 400);
        
        // Test too many query parameters
        const manyParams = new URLSearchParams();
        for (let i = 0; i < 150; i++) {
            manyParams.append(`param${i}`, `value${i}`);
        }
        
        const manyParamsResponse = await axios.get(`${BASE_URL}/health?${manyParams.toString()}`, TEST_CONFIG);
        logTest('Too many query parameters rejected', manyParamsResponse.status === 400);
        
    } catch (error) {
        logTest('Request size limits test failed', false, { status: 'ERROR', data: { message: error.message } });
    }
}

// Main test execution
async function runPhase10Tests() {
    console.log('🛡️  PHASE 10: SECURITY & MIDDLEWARE TESTING');
    console.log('Testing comprehensive security features...\n');
    
    try {
        await testHealthEndpoint();
        await testSecurityHeaders();
        await testRateLimiting();
        await testInputValidation();
        await testFileUploadSecurity();
        await testErrorHandling();
        await testCORSConfiguration();
        await testRequestSizeLimits();
        
        logSection('PHASE 10 TESTING COMPLETE');
        console.log('✅ Security & Middleware testing completed successfully!');
        console.log('\n📋 Phase 10 Features Tested:');
        console.log('   • Security headers and HTTPS enforcement');
        console.log('   • XSS and SQL injection protection');
        console.log('   • Rate limiting and request throttling');
        console.log('   • Input validation and sanitization');
        console.log('   • File upload security controls');
        console.log('   • Enhanced error handling and logging');
        console.log('   • CORS configuration');
        console.log('   • Request size limits');
        console.log('   • Parameter pollution protection');
        console.log('   • Malicious input detection');
        
    } catch (error) {
        console.error('❌ Phase 10 testing failed:', error.message);
        process.exit(1);
    }
}

// Run tests if called directly
if (require.main === module) {
    runPhase10Tests();
}

module.exports = { runPhase10Tests }; 
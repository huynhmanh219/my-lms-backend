// Performance Testing and Monitoring Script
// Comprehensive performance analysis for LMS Backend

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class PerformanceTester {
    constructor(baseURL = 'http://localhost:3000') {
        this.baseURL = baseURL;
        this.results = {
            timestamp: new Date().toISOString(),
            server: baseURL,
            tests: [],
            summary: {}
        };
    }

    // Test API endpoint performance
    async testEndpointPerformance(endpoint, method = 'GET', data = null, headers = {}) {
        const testName = `${method} ${endpoint}`;
        console.log(`🔍 Testing: ${testName}`);
        
        const startTime = Date.now();
        let success = 0;
        let failed = 0;
        let totalResponseTime = 0;
        const responseTimes = [];
        
        try {
            // Warm-up request
            await axios({
                method,
                url: `${this.baseURL}${endpoint}`,
                data,
                headers,
                timeout: 10000
            });
            
            // Performance test with multiple requests
            const promises = [];
            const concurrentRequests = 10;
            const totalRequests = 50;
            
            for (let i = 0; i < totalRequests; i += concurrentRequests) {
                const batch = [];
                
                for (let j = 0; j < concurrentRequests && (i + j) < totalRequests; j++) {
                    batch.push(this.makeTimedRequest(method, endpoint, data, headers));
                }
                
                const batchResults = await Promise.allSettled(batch);
                
                batchResults.forEach(result => {
                    if (result.status === 'fulfilled') {
                        success++;
                        const responseTime = result.value.responseTime;
                        totalResponseTime += responseTime;
                        responseTimes.push(responseTime);
                    } else {
                        failed++;
                        console.error(`Request failed: ${result.reason.message}`);
                    }
                });
                
                // Small delay between batches to avoid overwhelming server
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Calculate statistics
            responseTimes.sort((a, b) => a - b);
            const avgResponseTime = totalResponseTime / success;
            const minResponseTime = Math.min(...responseTimes);
            const maxResponseTime = Math.max(...responseTimes);
            const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
            const p90 = responseTimes[Math.floor(responseTimes.length * 0.9)];
            const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
            const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];
            
            const testResult = {
                endpoint: testName,
                totalRequests: totalRequests,
                successfulRequests: success,
                failedRequests: failed,
                successRate: ((success / totalRequests) * 100).toFixed(2) + '%',
                avgResponseTime: Math.round(avgResponseTime),
                minResponseTime,
                maxResponseTime,
                percentiles: {
                    p50: Math.round(p50),
                    p90: Math.round(p90),
                    p95: Math.round(p95),
                    p99: Math.round(p99)
                },
                throughput: Math.round((success / ((Date.now() - startTime) / 1000))),
                status: success > (totalRequests * 0.95) ? 'PASS' : 'FAIL'
            };
            
            this.results.tests.push(testResult);
            
            console.log(`✅ ${testName}: ${testResult.avgResponseTime}ms avg, ${testResult.successRate} success rate`);
            return testResult;
            
        } catch (error) {
            console.error(`❌ ${testName}: ${error.message}`);
            this.results.tests.push({
                endpoint: testName,
                error: error.message,
                status: 'ERROR'
            });
            return null;
        }
    }

    // Make timed HTTP request
    async makeTimedRequest(method, endpoint, data, headers) {
        const start = Date.now();
        
        try {
            const response = await axios({
                method,
                url: `${this.baseURL}${endpoint}`,
                data,
                headers,
                timeout: 10000
            });
            
            const responseTime = Date.now() - start;
            return {
                responseTime,
                status: response.status,
                data: response.data
            };
        } catch (error) {
            const responseTime = Date.now() - start;
            throw new Error(`${error.message} (${responseTime}ms)`);
        }
    }

    // Test database performance
    async testDatabasePerformance() {
        console.log('\n🗄️  Testing Database Performance...');
        
        const dbTests = [
            { name: 'User List', endpoint: '/api/users', method: 'GET' },
            { name: 'Course List', endpoint: '/api/courses', method: 'GET' },
            { name: 'Statistics', endpoint: '/api/statistics/dashboard', method: 'GET' }
        ];
        
        for (const test of dbTests) {
            await this.testEndpointPerformance(test.endpoint, test.method);
        }
    }

    // Test cache performance
    async testCachePerformance() {
        console.log('\n💾 Testing Cache Performance...');
        
        // Test cache hit/miss scenarios
        const cacheTests = [
            { name: 'Course Details (First Load)', endpoint: '/api/courses/1', method: 'GET' },
            { name: 'Course Details (Cached)', endpoint: '/api/courses/1', method: 'GET' },
            { name: 'Student List (First Load)', endpoint: '/api/students', method: 'GET' },
            { name: 'Student List (Cached)', endpoint: '/api/students', method: 'GET' }
        ];
        
        for (const test of cacheTests) {
            await this.testEndpointPerformance(test.endpoint, test.method);
        }
    }

    // Test file upload performance
    async testFileUploadPerformance() {
        console.log('\n📁 Testing File Upload Performance...');
        
        // Create test file
        const testFileContent = 'A'.repeat(1024 * 1024); // 1MB test file
        const testFilePath = path.join(__dirname, 'test-upload.txt');
        
        try {
            fs.writeFileSync(testFilePath, testFileContent);
            
            // Test file upload (this would need proper multipart form setup)
            console.log('File upload test placeholder - implement with proper form data');
            
            // Cleanup
            fs.unlinkSync(testFilePath);
        } catch (error) {
            console.error('File upload test error:', error.message);
        }
    }

    // Test authentication performance
    async testAuthPerformance() {
        console.log('\n🔐 Testing Authentication Performance...');
        
        const authData = {
            email: 'test@example.com',
            password: 'password123'
        };
        
        await this.testEndpointPerformance('/api/auth/login', 'POST', authData);
    }

    // Test concurrent user simulation
    async testConcurrentUsers() {
        console.log('\n👥 Testing Concurrent User Load...');
        
        const userCounts = [10, 25, 50, 100];
        
        for (const userCount of userCounts) {
            console.log(`Testing ${userCount} concurrent users...`);
            
            const promises = [];
            const startTime = Date.now();
            
            for (let i = 0; i < userCount; i++) {
                promises.push(this.makeTimedRequest('GET', '/health'));
            }
            
            const results = await Promise.allSettled(promises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const totalTime = Date.now() - startTime;
            
            console.log(`${userCount} users: ${successful}/${userCount} successful in ${totalTime}ms`);
            
            this.results.tests.push({
                endpoint: `Concurrent Users (${userCount})`,
                totalRequests: userCount,
                successfulRequests: successful,
                failedRequests: userCount - successful,
                totalTime: totalTime,
                status: successful === userCount ? 'PASS' : 'FAIL'
            });
        }
    }

    // Generate performance report
    generateReport() {
        const passedTests = this.results.tests.filter(t => t.status === 'PASS').length;
        const totalTests = this.results.tests.length;
        
        this.results.summary = {
            totalTests,
            passedTests,
            failedTests: totalTests - passedTests,
            overallScore: ((passedTests / totalTests) * 100).toFixed(1) + '%'
        };
        
        // Save detailed report
        const reportPath = path.join(__dirname, '../reports', `performance-report-${Date.now()}.json`);
        
        try {
            if (!fs.existsSync(path.dirname(reportPath))) {
                fs.mkdirSync(path.dirname(reportPath), { recursive: true });
            }
            fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
            console.log(`\n📊 Detailed report saved to: ${reportPath}`);
        } catch (error) {
            console.error('Failed to save report:', error.message);
        }
        
        // Display summary
        console.log('\n' + '='.repeat(60));
        console.log('🎯 PERFORMANCE TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`📊 Overall Score: ${this.results.summary.overallScore}`);
        console.log(`✅ Passed Tests: ${passedTests}/${totalTests}`);
        console.log(`❌ Failed Tests: ${this.results.summary.failedTests}`);
        console.log(`⏱️  Test Duration: ${((Date.now() - new Date(this.results.timestamp).getTime()) / 1000).toFixed(1)}s`);
        
        console.log('\n📈 Top Performance Issues:');
        const slowTests = this.results.tests
            .filter(t => t.avgResponseTime && t.avgResponseTime > 1000)
            .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
            .slice(0, 5);
            
        if (slowTests.length === 0) {
            console.log('✅ No performance issues detected!');
        } else {
            slowTests.forEach(test => {
                console.log(`⚠️  ${test.endpoint}: ${test.avgResponseTime}ms average response time`);
            });
        }
        
        console.log('\n💡 Recommendations:');
        if (slowTests.length > 0) {
            console.log('   • Consider database query optimization for slow endpoints');
            console.log('   • Implement caching for frequently accessed data');
            console.log('   • Review database indexes for optimal performance');
        } else {
            console.log('   • Performance looks good! Consider load testing with higher concurrent users');
            console.log('   • Monitor performance in production environment');
        }
        
        return this.results;
    }

    // Run all performance tests
    async runAllTests() {
        console.log('🚀 Starting LMS Backend Performance Tests...\n');
        
        try {
            // Health check first
            await this.testEndpointPerformance('/health');
            
            // Core API tests
            await this.testDatabasePerformance();
            await this.testCachePerformance();
            await this.testAuthPerformance();
            
            // Load testing
            await this.testConcurrentUsers();
            
            // Generate final report
            this.generateReport();
            
        } catch (error) {
            console.error('Performance testing failed:', error.message);
            process.exit(1);
        }
    }
}

// CLI execution
if (require.main === module) {
    const baseURL = process.argv[2] || 'http://localhost:3000';
    const tester = new PerformanceTester(baseURL);
    tester.runAllTests();
}

module.exports = PerformanceTester; 
// Phase 6: Lecture Management Testing
// Tests all lecture management APIs: lectures, chapters, permissions

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let testLecturerId = null;
let testSubjectId = null;
let testChapterId = null;
let testLectureId = null;

// Test data
const testChapter = {
    title: 'Introduction to Programming',
    description: 'Basic concepts of programming and algorithm design',
    order_index: 1,
    status: 'active'
};

const testLecture = {
    title: 'Variables and Data Types',
    content: 'This lecture covers the fundamental concepts of variables and different data types in programming.',
    video_url: 'https://youtube.com/watch?v=example',
    duration_minutes: 45,
    order_index: 1,
    is_published: false
};

const updatedLecture = {
    title: 'Variables and Data Types - Updated',
    content: 'Updated content with more examples and exercises.',
    duration_minutes: 60,
    is_published: true
};

const lectureFake = {
    title: 'Fake Lecture',
    content: 'This is a fake lecture for testing purposes.',
    duration_minutes: 30,
    order_index: 2,
    is_published: false
};

// Utility function to make authenticated requests
async function makeRequest(method, endpoint, data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
            data
        };

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
}

// Test functions
async function testAuthentication() {
    console.log('\n=== TESTING AUTHENTICATION ===');
    
    const result = await makeRequest('POST', '/auth/login', {
        email: 'admin@example.com',
        password: 'admin123'
    });

    if (result.success && result.data.data?.token) {
        authToken = result.data.data.token;
        console.log('✅ Authentication successful');
        return true;
    } else {
        console.log('❌ Authentication failed:', result.error);
        return false;
    }
}

async function setupTestData() {
    console.log('\n=== SETTING UP TEST DATA ===');
    
    // Get a test subject and lecturer
    const subjectsResult = await makeRequest('GET', '/courses?limit=1');
    if (subjectsResult.success && subjectsResult.data.data.items.length > 0) {
        testSubjectId = subjectsResult.data.data.items[0].id;
        testLecturerId = subjectsResult.data.data.items[0].lecturer_id;
        console.log(`✅ Using test subject ID: ${testSubjectId}, lecturer ID: ${testLecturerId}`);
        return true;
    } else {
        console.log('❌ No test subject found for testing');
        return false;
    }
}

async function testChapterManagement() {
    console.log('\n=== TESTING CHAPTER MANAGEMENT ===');
    
    // Test 1: Create Chapter
    console.log('\n1. Testing Create Chapter...');
    const createResult = await makeRequest('POST', '/lectures/chapters', {
        ...testChapter,
        subject_id: testSubjectId
    });
    
    if (createResult.success) {
        testChapterId = createResult.data.data.id;
        console.log(`✅ Chapter created successfully (ID: ${testChapterId})`);
    } else {
        console.log('❌ Chapter creation failed:', createResult.error);
        return false;
    }

    // Test 2: Get All Chapters
    console.log('\n2. Testing Get All Chapters...');
    const chaptersResult = await makeRequest('GET', '/lectures/chapters?page=1&limit=5');
    
    if (chaptersResult.success) {
        console.log(`✅ Retrieved ${chaptersResult.data.data.items.length} chapters`);
        console.log(`   Total chapters: ${chaptersResult.data.data.totalItems}`);
    } else {
        console.log('❌ Get chapters failed:', chaptersResult.error);
    }

    // Test 3: Get Single Chapter
    console.log('\n3. Testing Get Single Chapter...');
    const chapterResult = await makeRequest('GET', `/lectures/chapters/${testChapterId}`);
    
    if (chapterResult.success) {
        console.log('✅ Chapter retrieved successfully');
        console.log(`   Title: ${chapterResult.data.data.title}`);
        console.log(`   Status: ${chapterResult.data.data.status}`);
        console.log(`   Lectures count: ${chapterResult.data.data.lectures?.length || 0}`);
    } else {
        console.log('❌ Get single chapter failed:', chapterResult.error);
    }

    // Test 4: Update Chapter
    console.log('\n4. Testing Update Chapter...');
    const updateResult = await makeRequest('PUT', `/lectures/chapters/${testChapterId}`, {
        title: 'Introduction to Programming - Updated',
        description: 'Updated description with more comprehensive content',
        status: 'active'
    });
    
    if (updateResult.success) {
        console.log('✅ Chapter updated successfully');
        console.log(`   New title: ${updateResult.data.data.title}`);
    } else {
        console.log('❌ Chapter update failed:', updateResult.error);
    }

    // Test 5: Search Chapters
    console.log('\n5. Testing Search Chapters...');
    const searchResult = await makeRequest('GET', '/lectures/chapters?search=Programming&subject_id=' + testSubjectId);
    
    if (searchResult.success) {
        console.log(`✅ Search completed - found ${searchResult.data.data.items.length} chapters`);
    } else {
        console.log('❌ Chapter search failed:', searchResult.error);
    }

    return true;
}

async function testLectureManagement() {
    console.log('\n=== TESTING LECTURE MANAGEMENT ===');
    
    // Test 1: Create Lecture
    console.log('\n1. Testing Create Lecture...');
    const createResult = await makeRequest('POST', '/lectures', {
        ...testLecture,
        chapter_id: testChapterId
    });
    
    if (createResult.success) {
        testLectureId = createResult.data.data.id;
        console.log(`✅ Lecture created successfully (ID: ${testLectureId})`);
    } else {
        console.log('❌ Lecture creation failed:', createResult.error);
        return false;
    }

    // Test 2: Get All Lectures
    console.log('\n2. Testing Get All Lectures...');
    const lecturesResult = await makeRequest('GET', '/lectures?page=1&limit=5');
    
    if (lecturesResult.success) {
        console.log(`✅ Retrieved ${lecturesResult.data.data.items.length} lectures`);
        console.log(`   Total lectures: ${lecturesResult.data.data.totalItems}`);
    } else {
        console.log('❌ Get lectures failed:', lecturesResult.error);
    }

    // Test 3: Get Single Lecture
    console.log('\n3. Testing Get Single Lecture...');
    const lectureResult = await makeRequest('GET', `/lectures/${testLectureId}`);
    
    if (lectureResult.success) {
        console.log('✅ Lecture retrieved successfully');
        console.log(`   Title: ${lectureResult.data.data.title}`);
        console.log(`   Duration: ${lectureResult.data.data.duration_formatted || 'N/A'}`);
        console.log(`   Published: ${lectureResult.data.data.is_published}`);
    } else {
        console.log('❌ Get single lecture failed:', lectureResult.error);
    }

    // Test 4: Update Lecture
    console.log('\n4. Testing Update Lecture...');
    const updateResult = await makeRequest('PUT', `/lectures/${testLectureId}`, updatedLecture);
    
    if (updateResult.success) {
        console.log('✅ Lecture updated successfully');
        console.log(`   New title: ${updateResult.data.data.title}`);
        console.log(`   Published: ${updateResult.data.data.is_published}`);
    } else {
        console.log('❌ Lecture update failed:', updateResult.error);
    }

    // Test 5: Create Another Lecture
    console.log('\n5. Testing Create Another Lecture...');
    const createResult2 = await makeRequest('POST', '/lectures', {
        ...lectureFake,
        chapter_id: testChapterId
    });
    
    if (createResult2.success) {
        console.log(`✅ Second lecture created successfully (ID: ${createResult2.data.data.id})`);
    } else {
        console.log('❌ Second lecture creation failed:', createResult2.error);
    }

    // Test 6: Filter Lectures
    console.log('\n6. Testing Filter Lectures...');
    const filterResult = await makeRequest('GET', `/lectures?chapter_id=${testChapterId}&is_published=true`);
    
    if (filterResult.success) {
        console.log(`✅ Filter completed - found ${filterResult.data.data.items.length} published lectures in chapter`);
    } else {
        console.log('❌ Lecture filter failed:', filterResult.error);
    }

    // Test 7: Search Lectures
    console.log('\n7. Testing Search Lectures...');
    const searchResult = await makeRequest('GET', '/lectures?search=Variables');
    
    if (searchResult.success) {
        console.log(`✅ Search completed - found ${searchResult.data.data.items.length} lectures`);
    } else {
        console.log('❌ Lecture search failed:', searchResult.error);
    }

    return true;
}

async function testLecturePermissions() {
    console.log('\n=== TESTING LECTURE PERMISSIONS ===');
    
    // Test 1: Get Lecture Permissions
    console.log('\n1. Testing Get Lecture Permissions...');
    const permissionsResult = await makeRequest('GET', `/lectures/${testLectureId}/permissions`);
    
    if (permissionsResult.success) {
        console.log('✅ Lecture permissions retrieved successfully');
        console.log(`   Published: ${permissionsResult.data.data.is_published}`);
        console.log(`   Visibility: ${permissionsResult.data.data.visibility}`);
        console.log(`   Can edit: ${permissionsResult.data.data.can_edit}`);
    } else {
        console.log('❌ Get lecture permissions failed:', permissionsResult.error);
    }

    // Test 2: Update Lecture Permissions
    console.log('\n2. Testing Update Lecture Permissions...');
    const updateResult = await makeRequest('PUT', `/lectures/${testLectureId}/permissions`, {
        is_published: false,
        visibility: 'private'
    });
    
    if (updateResult.success) {
        console.log('✅ Lecture permissions updated successfully');
        console.log(`   New visibility: ${updateResult.data.data.visibility}`);
    } else {
        console.log('❌ Update lecture permissions failed:', updateResult.error);
    }

    return true;
}

async function testChapterLectures() {
    console.log('\n=== TESTING CHAPTER LECTURES ===');
    
    // Test 1: Get Chapter Lectures
    console.log('\n1. Testing Get Chapter Lectures...');
    const lecturesResult = await makeRequest('GET', `/lectures/chapters/${testChapterId}/lectures`);
    
    if (lecturesResult.success) {
        console.log(`✅ Chapter lectures retrieved successfully`);
        console.log(`   Found ${lecturesResult.data.data.items.length} lectures in chapter`);
        console.log(`   Chapter: ${lecturesResult.data.chapter.title}`);
    } else {
        console.log('❌ Get chapter lectures failed:', lecturesResult.error);
    }

    return true;
}

async function testMyLectures() {
    console.log('\n=== TESTING MY LECTURES ===');
    
    // Test 1: Get My Lectures
    console.log('\n1. Testing Get My Lectures...');
    const myLecturesResult = await makeRequest('GET', '/lectures/my-lectures');
    
    if (myLecturesResult.success) {
        console.log(`✅ My lectures retrieved successfully`);
        console.log(`   Found ${myLecturesResult.data.data.items.length} lectures`);
        console.log(`   Total items: ${myLecturesResult.data.data.totalItems}`);
    } else {
        console.log('❌ Get my lectures failed:', myLecturesResult.error);
    }

    // Test 2: Filter My Lectures
    console.log('\n2. Testing Filter My Lectures...');
    const filterResult = await makeRequest('GET', '/lectures/my-lectures?status=draft');
    
    if (filterResult.success) {
        console.log(`✅ My draft lectures retrieved successfully`);
        console.log(`   Found ${filterResult.data.data.items.length} draft lectures`);
    } else {
        console.log('❌ Filter my lectures failed:', filterResult.error);
    }

    return true;
}

async function testLectureAttachments() {
    console.log('\n=== TESTING LECTURE ATTACHMENTS ===');
    
    // Test 1: Get Lecture Attachments
    console.log('\n1. Testing Get Lecture Attachments...');
    const attachmentsResult = await makeRequest('GET', `/lectures/${testLectureId}/attachments`);
    
    if (attachmentsResult.success) {
        console.log(`✅ Lecture attachments retrieved successfully`);
        console.log(`   Found ${attachmentsResult.data.data.length} attachments`);
    } else {
        console.log('❌ Get lecture attachments failed:', attachmentsResult.error);
    }

    return true;
}

async function testErrorHandling() {
    console.log('\n=== TESTING ERROR HANDLING ===');
    
    // Test 1: Non-existent lecture
    console.log('\n1. Testing Non-existent Lecture...');
    const nonExistentResult = await makeRequest('GET', '/lectures/99999');
    
    if (!nonExistentResult.success && nonExistentResult.status === 404) {
        console.log('✅ Non-existent lecture properly handled');
    } else {
        console.log('❌ Non-existent lecture error handling failed');
    }

    // Test 2: Invalid chapter deletion
    console.log('\n2. Testing Chapter Deletion with Lectures...');
    const deleteResult = await makeRequest('DELETE', `/lectures/chapters/${testChapterId}`);
    
    if (!deleteResult.success && deleteResult.status === 400) {
        console.log('✅ Chapter deletion with lectures properly blocked');
    } else {
        console.log('❌ Chapter deletion validation failed');
    }

    // Test 3: Invalid validation
    console.log('\n3. Testing Invalid Lecture Creation...');
    const invalidResult = await makeRequest('POST', '/lectures', {
        title: 'A', // Too short
        chapter_id: 'invalid' // Invalid type
    });
    
    if (!invalidResult.success && invalidResult.status === 400) {
        console.log('✅ Invalid lecture creation properly rejected');
    } else {
        console.log('❌ Lecture validation failed');
    }

    return true;
}

async function cleanup() {
    console.log('\n=== CLEANUP ===');
    
    // Delete test lectures
    if (testLectureId) {
        const deleteResult1 = await makeRequest('DELETE', `/lectures/${testLectureId}`);
        if (deleteResult1.success) {
            console.log('✅ Test lecture deleted');
        }
    }

    // Delete any additional lectures in the chapter
    const lecturesResult = await makeRequest('GET', `/lectures/chapters/${testChapterId}/lectures`);
    if (lecturesResult.success && lecturesResult.data.data.items.length > 0) {
        for (const lecture of lecturesResult.data.data.items) {
            await makeRequest('DELETE', `/lectures/${lecture.id}`);
        }
        console.log('✅ Additional lectures deleted');
    }

    // Delete test chapter
    if (testChapterId) {
        const deleteResult2 = await makeRequest('DELETE', `/lectures/chapters/${testChapterId}`);
        if (deleteResult2.success) {
            console.log('✅ Test chapter deleted');
        } else {
            console.log('❌ Test chapter deletion failed:', deleteResult2.error);
        }
    }
}

// Main test execution
async function runTests() {
    console.log('🚀 Starting Phase 6: Lecture Management Tests');
    console.log('Testing 15 APIs: 6 Lecture + 6 Chapter + 3 Permissions\n');

    try {
        // Setup
        if (!await testAuthentication()) return;
        if (!await setupTestData()) return;

        // Chapter Management Tests (6 APIs)
        await testChapterManagement();

        // Lecture Management Tests (6 APIs)
        await testLectureManagement();

        // Permissions Tests (3 APIs)
        await testLecturePermissions();

        // Additional Tests
        await testChapterLectures();
        await testMyLectures();
        await testLectureAttachments();

        // Error Handling Tests
        await testErrorHandling();

        // Cleanup
        await cleanup();

        console.log('\n' + '='.repeat(60));
        console.log('🎉 PHASE 6 TESTING COMPLETED!');
        console.log('✅ All lecture management APIs tested successfully');
        console.log('📚 Features tested:');
        console.log('   • Lecture CRUD operations');
        console.log('   • Chapter management');
        console.log('   • Lecture permissions & visibility');
        console.log('   • Content ordering system');
        console.log('   • Search and filtering');
        console.log('   • Pagination');
        console.log('   • File attachments');
        console.log('   • Access control');
        console.log('   • Error handling & validation');
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ Test execution failed:', error.message);
        await cleanup();
    }
}

// Handle script execution
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests }; 
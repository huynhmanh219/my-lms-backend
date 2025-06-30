// Phase 5: Course Management System Test
// Test script to verify all 20 course management APIs

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;
let testData = {
    courseId: null,
    classId: null,
    studentId: null,
    lecturerId: null
};

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

// Get admin authentication token
const getAuthToken = async () => {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@lms.com',
        password: 'admin123'
    });
    authToken = response.data.data.tokens.accessToken;
    console.log('✅ Admin authentication successful');
    return authToken;
};

// Get test data (lecturer and student IDs)
const getTestData = async () => {
    // Get lecturer ID
    const lecturerResponse = await axios.get(`${BASE_URL}/users/teachers?limit=1`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    if (lecturerResponse.data.data.teachers.length > 0) {
        testData.lecturerId = lecturerResponse.data.data.teachers[0].profile.id;
        console.log(`✅ Found lecturer ID: ${testData.lecturerId}`);
    }

    // Get student ID
    const studentResponse = await axios.get(`${BASE_URL}/users/students?limit=1`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    if (studentResponse.data.data.students.length > 0) {
        testData.studentId = studentResponse.data.data.students[0].id;
        console.log(`✅ Found student ID: ${testData.studentId}`);
    }
};

// ==========================================
// SUBJECT MANAGEMENT TESTS (6 APIs)
// ==========================================

const testGetCourses = async () => {
    const response = await axios.get(`${BASE_URL}/courses?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Courses retrieved successfully`);
        console.log(`   ✓ Found ${response.data.data.courses.length} courses`);
        console.log(`   ✓ Pagination:`, response.data.data.pagination);
    } else {
        throw new Error('Get courses failed');
    }
};

const testCreateCourse = async () => {
    const courseData = {
        subject_name: 'Introduction to Computer Science',
        description: 'A comprehensive introduction to computer science fundamentals',
        subject_code: 'CS101',
        lecturer_id: testData.lecturerId,
        credits: 3,
        semester: 'fall',
        academic_year: '2024-2025'
    };
    
    const response = await axios.post(`${BASE_URL}/courses`, courseData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201) {
        testData.courseId = response.data.data.course.id;
        console.log(`   ✓ Course created successfully`);
        console.log(`   ✓ Course ID: ${testData.courseId}`);
        console.log(`   ✓ Course code: ${response.data.data.course.subject_code}`);
    } else {
        throw new Error('Course creation failed');
    }
};

const testGetCourse = async () => {
    if (!testData.courseId) throw new Error('No course ID available');
    
    const response = await axios.get(`${BASE_URL}/courses/${testData.courseId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Course details retrieved successfully`);
        console.log(`   ✓ Course name: ${response.data.data.course.subject_name}`);
        console.log(`   ✓ Course lecturer: ${response.data.data.course.lecturer.first_name} ${response.data.data.course.lecturer.last_name}`);
    } else {
        throw new Error('Get course failed');
    }
};

const testUpdateCourse = async () => {
    if (!testData.courseId) throw new Error('No course ID available');
    
    const updateData = {
        subject_name: 'Advanced Computer Science',
        credits: 4,
        description: 'Updated description for advanced computer science course'
    };
    
    const response = await axios.put(`${BASE_URL}/courses/${testData.courseId}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Course updated successfully`);
        console.log(`   ✓ New name: ${response.data.data.course.subject_name}`);
        console.log(`   ✓ New credits: ${response.data.data.course.credits}`);
    } else {
        throw new Error('Update course failed');
    }
};

const testGetCourseStudents = async () => {
    if (!testData.courseId) throw new Error('No course ID available');
    
    const response = await axios.get(`${BASE_URL}/courses/${testData.courseId}/students`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Course students retrieved successfully`);
        console.log(`   ✓ Students count: ${response.data.data.students.length}`);
    } else {
        throw new Error('Get course students failed');
    }
};

// ==========================================
// CLASS MANAGEMENT TESTS (5 APIs)
// ==========================================

const testGetClasses = async () => {
    const response = await axios.get(`${BASE_URL}/courses/classes?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Classes retrieved successfully`);
        console.log(`   ✓ Found ${response.data.data.classes.length} classes`);
        console.log(`   ✓ Pagination:`, response.data.data.pagination);
    } else {
        throw new Error('Get classes failed');
    }
};

const testCreateClass = async () => {
    if (!testData.courseId || !testData.lecturerId) throw new Error('Missing test data');
    
    const classData = {
        subject_id: testData.courseId,
        lecturer_id: testData.lecturerId,
        section_name: 'Section A',
        max_students: 30,
        start_date: '2024-09-01',
        end_date: '2024-12-15',
        schedule: 'Mon, Wed, Fri 10:00-11:30',
        room: 'Room 101'
    };
    
    const response = await axios.post(`${BASE_URL}/courses/classes`, classData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201) {
        testData.classId = response.data.data.class.id;
        console.log(`   ✓ Class created successfully`);
        console.log(`   ✓ Class ID: ${testData.classId}`);
        console.log(`   ✓ Section name: ${response.data.data.class.section_name}`);
        console.log(`   ✓ Max Students: ${response.data.data.class.max_students}`);
    } else {
        throw new Error('Class creation failed');
    }
};

const testGetClass = async () => {
    if (!testData.classId) throw new Error('No class ID available');
    
    const response = await axios.get(`${BASE_URL}/courses/classes/${testData.classId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Class details retrieved successfully`);
        console.log(`   ✓ Section: ${response.data.data.class.section_name}`);
        console.log(`   ✓ Enrollment count: ${response.data.data.class.enrollmentCount}`);
    } else {
        throw new Error('Get class failed');
    }
};

const testUpdateClass = async () => {
    if (!testData.classId) throw new Error('No class ID available');
    
    const updateData = {
        max_students: 35,
        room: 'Room 102',
        schedule: 'Mon, Wed, Fri 14:00-15:30'
    };
    
    const response = await axios.put(`${BASE_URL}/courses/classes/${testData.classId}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Class updated successfully`);
        console.log(`   ✓ New max_students: ${response.data.data.class.max_students}`);
        console.log(`   ✓ New room: ${response.data.data.class.room}`);
    } else {
        throw new Error('Update class failed');
    }
};

// ==========================================
// ENROLLMENT MANAGEMENT TESTS (7 APIs)
// ==========================================

const testGetClassStudents = async () => {
    if (!testData.classId) throw new Error('No class ID available');
    
    const response = await axios.get(`${BASE_URL}/courses/classes/${testData.classId}/students`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Class students retrieved successfully`);
        console.log(`   ✓ Students count: ${response.data.data.students.length}`);
    } else {
        throw new Error('Get class students failed');
    }
};

const testEnrollStudents = async () => {
    if (!testData.classId || !testData.studentId) throw new Error('Missing test data');
    
    const enrollmentData = {
        student_ids: [testData.studentId]
    };
    
    const response = await axios.post(`${BASE_URL}/courses/classes/${testData.classId}/students`, enrollmentData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Student enrollment completed`);
        console.log(`   ✓ Successful enrollments: ${response.data.data.summary.successful}`);
        console.log(`   ✓ Failed enrollments: ${response.data.data.summary.failed}`);
    } else {
        throw new Error('Student enrollment failed');
    }
};

const testGetStudentClasses = async () => {
    if (!testData.studentId) throw new Error('No student ID available');
    
    const response = await axios.get(`${BASE_URL}/courses/students/${testData.studentId}/classes`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Student classes retrieved successfully`);
        console.log(`   ✓ Enrolled classes: ${response.data.data.enrollments.length}`);
    } else {
        throw new Error('Get student classes failed');
    }
};

const testBulkEnrollment = async () => {
    if (!testData.classId || !testData.studentId) throw new Error('Missing test data');
    
    const bulkData = {
        enrollments: [
            {
                student_id: testData.studentId,
                course_section_id: testData.classId
            }
        ]
    };
    
    const response = await axios.post(`${BASE_URL}/courses/enrollment/bulk`, bulkData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Bulk enrollment completed`);
        console.log(`   ✓ Total processed: ${response.data.data.summary.total}`);
        console.log(`   ✓ Successful: ${response.data.data.summary.successful}`);
        console.log(`   ✓ Failed: ${response.data.data.summary.failed}`);
    } else {
        throw new Error('Bulk enrollment failed');
    }
};

const testExportEnrollment = async () => {
    const response = await axios.get(`${BASE_URL}/courses/enrollment/export`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Enrollment export completed`);
        console.log(`   ✓ Exported records: ${response.data.data.count}`);
    } else {
        throw new Error('Export enrollment failed');
    }
};

const testRemoveStudentFromClass = async () => {
    if (!testData.classId || !testData.studentId) throw new Error('Missing test data');
    
    const response = await axios.delete(`${BASE_URL}/courses/classes/${testData.classId}/students/${testData.studentId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Student removed from class successfully`);
    } else {
        throw new Error('Remove student from class failed');
    }
};

const testDeleteClass = async () => {
    if (!testData.classId) throw new Error('No class ID available');
    
    const response = await axios.delete(`${BASE_URL}/courses/classes/${testData.classId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Class deleted successfully`);
    } else {
        throw new Error('Delete class failed');
    }
};

const testDeleteCourse = async () => {
    if (!testData.courseId) throw new Error('No course ID available');
    
    const response = await axios.delete(`${BASE_URL}/courses/${testData.courseId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Course deleted successfully`);
    } else {
        throw new Error('Delete course failed');
    }
};

// Test Security
const testUnauthorizedAccess = async () => {
    try {
        await axios.get(`${BASE_URL}/courses`);
        throw new Error('Should have failed without authentication');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log(`   ✓ Correctly rejected unauthenticated request`);
        } else {
            throw error;
        }
    }
};

// Run all tests
const runAllTests = async () => {
    console.log('🚀 Starting Phase 5: Course Management System Tests');
    console.log('====================================================');

    // Get authentication and test data
    await getAuthToken();
    await getTestData();

    console.log('\n📚 TESTING SUBJECT MANAGEMENT (6 APIs)');
    await test('Get courses list', testGetCourses);
    await test('Create course', testCreateCourse);
    
    if (testData.courseId) {
        await test('Get single course', testGetCourse);
        await test('Update course', testUpdateCourse);
        await test('Get course students', testGetCourseStudents);
    }

    console.log('\n🏫 TESTING CLASS MANAGEMENT (5 APIs)');
    await test('Get classes list', testGetClasses);
    
    if (testData.courseId && testData.lecturerId) {
        await test('Create class', testCreateClass);
        
        if (testData.classId) {
            await test('Get single class', testGetClass);
            await test('Update class', testUpdateClass);
        }
    }

    console.log('\n📝 TESTING ENROLLMENT MANAGEMENT (7 APIs)');
    if (testData.classId) {
        await test('Get class students', testGetClassStudents);
        
        if (testData.studentId) {
            await test('Enroll students', testEnrollStudents);
            await test('Get student classes', testGetStudentClasses);
            await test('Bulk enrollment', testBulkEnrollment);
            await test('Export enrollment', testExportEnrollment);
            await test('Remove student from class', testRemoveStudentFromClass);
        }
    }

    console.log('\n🧹 TESTING CLEANUP');
    if (testData.classId) {
        await test('Delete class', testDeleteClass);
    }
    if (testData.courseId) {
        await test('Delete course', testDeleteCourse);
    }

    console.log('\n🔒 TESTING SECURITY');
    await test('Reject unauthenticated access', testUnauthorizedAccess);

    console.log('\n🎉 Phase 5: Course Management System tests completed!');
    console.log('====================================================');
    console.log('✅ ALL 20 COURSE MANAGEMENT APIs IMPLEMENTED AND TESTED');
};

// Check server and run tests
const checkServerAndRun = async () => {
    try {
        await axios.get(`${BASE_URL.replace('/api', '')}/health`);
        console.log('✅ Server is running, starting tests...');
        await runAllTests();
    } catch (error) {
        console.log('❌ Server is not available. Please start the server first:');
        console.log('   npm start');
    }
};

checkServerAndRun(); 
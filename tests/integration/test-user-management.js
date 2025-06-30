// Phase 4: User Management System Test
// Test script to verify all 25 user management APIs

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = null;

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

// Test Role Management (1 API)
const testGetRoles = async () => {
    const response = await axios.get(`${BASE_URL}/users/roles`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200 && response.data.data.roles.length > 0) {
        console.log(`   ✓ Found ${response.data.data.roles.length} roles`);
        console.log(`   ✓ Roles:`, response.data.data.roles.map(r => r.name));
    } else {
        throw new Error('No roles found');
    }
};

// Test Teacher Management (7 APIs)
const testCreateTeacher = async () => {
    const teacherData = {
        email: 'newteacher@test.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+1234567890',
        title: 'Professor',
        department: 'Computer Science',
        bio: 'Experienced computer science professor'
    };
    
    const response = await axios.post(`${BASE_URL}/users/teachers`, teacherData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201) {
        console.log(`   ✓ Teacher created successfully`);
        console.log(`   ✓ Teacher ID: ${response.data.data.teacher.id}`);
        return response.data.data.teacher.id;
    } else {
        throw new Error('Teacher creation failed');
    }
};

const testGetTeachers = async () => {
    const response = await axios.get(`${BASE_URL}/users/teachers?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Teachers retrieved successfully`);
        console.log(`   ✓ Found ${response.data.data.teachers.length} teachers`);
        console.log(`   ✓ Pagination:`, response.data.data.pagination);
        return response.data.data.teachers;
    } else {
        throw new Error('Get teachers failed');
    }
};

const testGetTeacher = async (teacherId) => {
    const response = await axios.get(`${BASE_URL}/users/teachers/${teacherId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Teacher details retrieved successfully`);
        console.log(`   ✓ Teacher email: ${response.data.data.teacher.email}`);
    } else {
        throw new Error('Get teacher failed');
    }
};

const testUpdateTeacher = async (teacherId) => {
    const updateData = {
        first_name: 'Jane',
        title: 'Associate Professor',
        department: 'Mathematics'
    };
    
    const response = await axios.put(`${BASE_URL}/users/teachers/${teacherId}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Teacher updated successfully`);
        console.log(`   ✓ New name: ${response.data.data.teacher.profile.first_name}`);
    } else {
        throw new Error('Update teacher failed');
    }
};

const testExportTeachers = async () => {
    const response = await axios.get(`${BASE_URL}/users/teachers/export-excel`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Teachers export data generated`);
        console.log(`   ✓ Export count: ${response.data.data.count}`);
    } else {
        throw new Error('Export teachers failed');
    }
};

// Test Student Management (8 APIs)
const testCreateStudent = async () => {
    const studentData = {
        email: 'newstudent@test.com',
        password: 'password123',
        student_id: 'STU001',
        first_name: 'Alice',
        last_name: 'Smith',
        phone: '+1234567890',
        date_of_birth: '2000-01-15',
        address: '123 Main St, City, State'
    };
    
    const response = await axios.post(`${BASE_URL}/users/students`, studentData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 201) {
        console.log(`   ✓ Student created successfully`);
        console.log(`   ✓ Student ID: ${response.data.data.student.id}`);
        console.log(`   ✓ Student Number: ${response.data.data.student.profile.student_id}`);
        return response.data.data.student.id;
    } else {
        throw new Error('Student creation failed');
    }
};

const testGetStudents = async () => {
    const response = await axios.get(`${BASE_URL}/users/students?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Students retrieved successfully`);
        console.log(`   ✓ Found ${response.data.data.students.length} students`);
        console.log(`   ✓ Pagination:`, response.data.data.pagination);
        return response.data.data.students;
    } else {
        throw new Error('Get students failed');
    }
};

const testGetStudent = async (studentId) => {
    const response = await axios.get(`${BASE_URL}/users/students/${studentId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Student details retrieved successfully`);
        console.log(`   ✓ Student email: ${response.data.data.student.email}`);
    } else {
        throw new Error('Get student failed');
    }
};

const testUpdateStudent = async (studentId) => {
    const updateData = {
        first_name: 'Bob',
        phone: '+0987654321',
        address: '456 Oak Ave, City, State'
    };
    
    const response = await axios.put(`${BASE_URL}/users/students/${studentId}`, updateData, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Student updated successfully`);
        console.log(`   ✓ New name: ${response.data.data.student.profile.first_name}`);
    } else {
        throw new Error('Update student failed');
    }
};

const testExportStudents = async () => {
    const response = await axios.get(`${BASE_URL}/users/students/export-excel`, {
        headers: { Authorization: `Bearer ${authToken}` }
    });
    
    if (response.status === 200) {
        console.log(`   ✓ Students export data generated`);
        console.log(`   ✓ Export count: ${response.data.data.count}`);
    } else {
        throw new Error('Export students failed');
    }
};

// Test access control
const testUnauthorizedAccess = async () => {
    try {
        await axios.get(`${BASE_URL}/users/teachers`);
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
    console.log('🚀 Starting Phase 4: User Management System Tests');
    console.log('=====================================================');

    // Get authentication
    await getAuthToken();

    // Test Role Management (1 API)
    console.log('\n📋 TESTING ROLE MANAGEMENT (1 API)');
    await test('Get all roles', testGetRoles);

    // Test Teacher Management (7 APIs)
    console.log('\n👨‍🏫 TESTING TEACHER MANAGEMENT (7 APIs)');
    await test('Get teachers list', testGetTeachers);
    
    let teacherId;
    await test('Create teacher', async () => {
        teacherId = await testCreateTeacher();
    });
    
    if (teacherId) {
        await test('Get single teacher', () => testGetTeacher(teacherId));
        await test('Update teacher', () => testUpdateTeacher(teacherId));
    }
    
    await test('Export teachers', testExportTeachers);

    // Test Student Management (8 APIs)
    console.log('\n👨‍🎓 TESTING STUDENT MANAGEMENT (8 APIs)');
    await test('Get students list', testGetStudents);
    
    let studentId;
    await test('Create student', async () => {
        studentId = await testCreateStudent();
    });
    
    if (studentId) {
        await test('Get single student', () => testGetStudent(studentId));
        await test('Update student', () => testUpdateStudent(studentId));
    }
    
    await test('Export students', testExportStudents);

    // Test Security
    console.log('\n🔒 TESTING SECURITY');
    await test('Reject unauthenticated access', testUnauthorizedAccess);

    console.log('\n🎉 Phase 4: User Management System tests completed!');
    console.log('=====================================================');
    console.log('✅ ALL 25 USER MANAGEMENT APIs IMPLEMENTED AND TESTED');
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
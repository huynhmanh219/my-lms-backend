const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3000/api';

// Test quiz APIs
async function testQuizAPI() {
    console.log('🧪 Testing Quiz APIs...\n');
    
    try {
        // Test login first to get token
        console.log('1️⃣ Testing login...');
        const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@lms.com',
                password: 'admin123'
            })
        });
        
        const loginResult = await loginResponse.json();
        console.log('Full login response:', JSON.stringify(loginResult, null, 2));
        
        if (!loginResponse.ok) {
            console.error('❌ Login failed:', loginResult.message);
            return;
        }
        
        const token = loginResult.data?.tokens?.accessToken;
        console.log('✅ Login successful');
        console.log('Token preview:', token ? token.substring(0, 50) + '...' : 'No token found');
        console.log('');
        
        // Test get quizzes
        console.log('2️⃣ Testing get quizzes...');
        const quizzesResponse = await fetch(`${API_BASE_URL}/quizzes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const quizzesResult = await quizzesResponse.json();
        
        if (quizzesResponse.ok) {
            console.log('✅ Get quizzes successful');
            console.log(`📊 Found ${quizzesResult.data?.results?.length || 0} quizzes\n`);
        } else {
            console.log('⚠️ Get quizzes result:', quizzesResult.message);
        }
        
        // Test get courses/subjects (needed for creating quiz)
        console.log('3️⃣ Testing get courses/subjects...');
        const coursesResponse = await fetch(`${API_BASE_URL}/courses`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const coursesResult = await coursesResponse.json();
        console.log('Courses response:', coursesResult);
        
        if (coursesResponse.ok && coursesResult.data?.courses?.length > 0) {
            console.log('✅ Get courses successful');
            const subjectId = coursesResult.data.courses[0].id;
            console.log(`📚 Using subject ID: ${subjectId}\n`);
            
            // Test create quiz
            console.log('4️⃣ Testing create quiz...');
            const createQuizResponse = await fetch(`${API_BASE_URL}/quizzes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: 'Test Quiz - API Test',
                    description: 'This is a test quiz created by API test',
                    subject_id: subjectId,
                    time_limit: 30,
                    attempts_allowed: 1,
                    total_points: 10,
                    show_results: true,
                    show_correct_answers: true
                })
            });
            
            const createQuizResult = await createQuizResponse.json();
            
            if (createQuizResponse.ok) {
                console.log('✅ Create quiz successful');
                const quizId = createQuizResult.data.id;
                console.log(`🆔 Created quiz ID: ${quizId}\n`);
                
                // Test get single quiz
                console.log('5️⃣ Testing get single quiz...');
                const singleQuizResponse = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const singleQuizResult = await singleQuizResponse.json();
                
                if (singleQuizResponse.ok) {
                    console.log('✅ Get single quiz successful');
                    console.log(`📝 Quiz title: ${singleQuizResult.data.title}\n`);
                } else {
                    console.log('⚠️ Get single quiz failed:', singleQuizResult.message);
                }
                
                // Test create question
                console.log('6️⃣ Testing create question...');
                const createQuestionResponse = await fetch(`${API_BASE_URL}/questions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        quiz_id: quizId,
                        question_text: 'What is 2 + 2?',
                        question_type: 'multiple_choice',
                        points: 1,
                        answers: [
                            { answer_text: '3', is_correct: false },
                            { answer_text: '4', is_correct: true },
                            { answer_text: '5', is_correct: false }
                        ]
                    })
                });
                
                const createQuestionResult = await createQuestionResponse.json();
                
                if (createQuestionResponse.ok) {
                    console.log('✅ Create question successful');
                    console.log(`❓ Question ID: ${createQuestionResult.data.id}\n`);
                } else {
                    console.log('⚠️ Create question failed:', createQuestionResult.message);
                }
                
                // Test get quiz questions
                console.log('7️⃣ Testing get quiz questions...');
                const questionsResponse = await fetch(`${API_BASE_URL}/quizzes/${quizId}/questions?include_answers=true`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const questionsResult = await questionsResponse.json();
                
                if (questionsResponse.ok) {
                    console.log('✅ Get quiz questions successful');
                    console.log(`❓ Found ${questionsResult.data?.length || 0} questions\n`);
                } else {
                    console.log('⚠️ Get quiz questions failed:', questionsResult.message);
                }
                
                // Test publish quiz
                console.log('8️⃣ Testing publish quiz...');
                const publishResponse = await fetch(`${API_BASE_URL}/quizzes/${quizId}/publish`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const publishResult = await publishResponse.json();
                
                if (publishResponse.ok) {
                    console.log('✅ Publish quiz successful');
                    console.log(`📢 Quiz status: ${publishResult.data.status}\n`);
                } else {
                    console.log('⚠️ Publish quiz failed:', publishResult.message);
                }
                
                console.log('🎉 All quiz API tests completed!\n');
                
            } else {
                console.log('❌ Create quiz failed:', createQuizResult.message);
                console.log('Full error:', createQuizResult);
            }
            
        } else {
            console.log('❌ No courses found or get courses failed');
            console.log('Courses result:', coursesResult);
        }
        
    } catch (error) {
        console.error('💥 Test error:', error.message);
    }
}

// Run the test
testQuizAPI(); 
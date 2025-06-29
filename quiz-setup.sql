-- Quiz System Tables Setup
-- Run this script to create quiz-related tables in LMS database

USE lms_database;

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id INT NOT NULL,
    course_section_id INT NULL,
    lecturer_id INT NOT NULL,
    total_points DECIMAL(8,2) NOT NULL DEFAULT 100.00,
    time_limit INT NULL COMMENT 'Time limit in minutes',
    attempts_allowed INT NOT NULL DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    shuffle_answers BOOLEAN DEFAULT FALSE,
    show_results BOOLEAN DEFAULT TRUE,
    show_correct_answers BOOLEAN DEFAULT TRUE,
    start_time DATETIME NULL,
    end_time DATETIME NULL,
    status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
    instructions TEXT NULL,
    passing_score DECIMAL(5,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (course_section_id) REFERENCES course_sections(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE RESTRICT,
    
    INDEX idx_subject_id (subject_id),
    INDEX idx_course_section_id (course_section_id),
    INDEX idx_lecturer_id (lecturer_id),
    INDEX idx_status (status),
    INDEX idx_time_range (start_time, end_time)
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank') 
        NOT NULL DEFAULT 'multiple_choice',
    points DECIMAL(8,2) NOT NULL DEFAULT 1.00,
    order_index INT NOT NULL DEFAULT 0,
    explanation TEXT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500) NULL,
    time_limit INT NULL COMMENT 'Individual question time limit in seconds',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_quiz_order (quiz_id, order_index),
    INDEX idx_question_type (question_type)
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT NOT NULL,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0,
    explanation TEXT NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    
    INDEX idx_question_id (question_id),
    INDEX idx_question_order (question_id, order_index),
    INDEX idx_is_correct (is_correct)
);

-- Create submissions table (quiz attempts)
CREATE TABLE IF NOT EXISTS submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quiz_id INT NOT NULL,
    student_id INT NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME NULL,
    time_spent INT NULL COMMENT 'Time spent in seconds',
    score DECIMAL(8,2) NULL,
    max_score DECIMAL(8,2) NULL,
    percentage DECIMAL(5,2) NULL,
    status ENUM('in_progress', 'submitted', 'graded', 'expired') 
        NOT NULL DEFAULT 'in_progress',
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    is_flagged BOOLEAN DEFAULT FALSE,
    flagged_reason TEXT NULL,
    graded_at DATETIME NULL,
    graded_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (graded_by) REFERENCES lecturers(id) ON DELETE SET NULL,
    
    INDEX idx_quiz_id (quiz_id),
    INDEX idx_student_id (student_id),
    INDEX idx_quiz_student (quiz_id, student_id),
    INDEX idx_status (status),
    INDEX idx_submitted_at (submitted_at),
    
    UNIQUE KEY unique_attempt (quiz_id, student_id, attempt_number)
);

-- Create responses table (individual question answers)
CREATE TABLE IF NOT EXISTS responses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_id INT NULL COMMENT 'For multiple choice questions',
    answer_text TEXT NULL COMMENT 'For text-based answers',
    is_correct BOOLEAN NULL,
    points_earned DECIMAL(8,2) NULL DEFAULT 0.00,
    is_flagged BOOLEAN DEFAULT FALSE,
    time_spent INT NULL COMMENT 'Time spent on this question in seconds',
    attempt_count INT DEFAULT 1,
    graded_by INT NULL,
    grader_feedback TEXT NULL,
    graded_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE SET NULL,
    FOREIGN KEY (graded_by) REFERENCES lecturers(id) ON DELETE SET NULL,
    
    INDEX idx_submission_id (submission_id),
    INDEX idx_question_id (question_id),
    INDEX idx_answer_id (answer_id),
    INDEX idx_is_correct (is_correct),
    
    UNIQUE KEY unique_response (submission_id, question_id)
);

-- Insert sample quiz data for testing
INSERT INTO quizzes (title, description, subject_id, lecturer_id, total_points, time_limit, status) 
SELECT 
    'Sample Quiz: Introduction to Programming',
    'Basic programming concepts quiz for testing',
    s.id,
    l.id,
    20.00,
    30,
    'published'
FROM subjects s
CROSS JOIN lecturers l
WHERE s.subject_code = (SELECT subject_code FROM subjects LIMIT 1)
  AND l.id = (SELECT id FROM lecturers LIMIT 1)
LIMIT 1;

-- Get the quiz ID for sample questions
SET @quiz_id = LAST_INSERT_ID();

-- Insert sample questions if quiz was created
INSERT INTO questions (quiz_id, question_text, question_type, points, order_index)
SELECT @quiz_id, 'What is a variable in programming?', 'multiple_choice', 5.00, 1
WHERE @quiz_id > 0
UNION ALL
SELECT @quiz_id, 'Programming is only about writing code. True or False?', 'true_false', 5.00, 2
WHERE @quiz_id > 0
UNION ALL
SELECT @quiz_id, 'Name three basic data types in programming.', 'short_answer', 10.00, 3
WHERE @quiz_id > 0;

-- Insert sample answers for multiple choice question
INSERT INTO answers (question_id, answer_text, is_correct, order_index)
SELECT q.id, 'A storage location with a name', TRUE, 1
FROM questions q
WHERE q.quiz_id = @quiz_id AND q.question_type = 'multiple_choice'
UNION ALL
SELECT q.id, 'A programming language', FALSE, 2
FROM questions q
WHERE q.quiz_id = @quiz_id AND q.question_type = 'multiple_choice'
UNION ALL
SELECT q.id, 'A computer program', FALSE, 3
FROM questions q
WHERE q.quiz_id = @quiz_id AND q.question_type = 'multiple_choice'
UNION ALL
SELECT q.id, 'A database table', FALSE, 4
FROM questions q
WHERE q.quiz_id = @quiz_id AND q.question_type = 'multiple_choice';

-- Insert answers for true/false question
INSERT INTO answers (question_id, answer_text, is_correct, order_index)
SELECT q.id, 'True', FALSE, 1
FROM questions q
WHERE q.quiz_id = @quiz_id AND q.question_type = 'true_false'
UNION ALL
SELECT q.id, 'False', TRUE, 2
FROM questions q
WHERE q.quiz_id = @quiz_id AND q.question_type = 'true_false';

-- Show created tables and sample data
SHOW TABLES LIKE '%quiz%';
SHOW TABLES LIKE '%question%';
SHOW TABLES LIKE '%answer%';
SHOW TABLES LIKE '%submission%';
SHOW TABLES LIKE '%response%';

SELECT 'Quiz tables setup completed successfully!' as message;
SELECT COUNT(*) as quiz_count FROM quizzes;
SELECT COUNT(*) as question_count FROM questions;
SELECT COUNT(*) as answer_count FROM answers;

-- End of quiz setup script 
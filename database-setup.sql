-- MySQL Database Setup for LMS
-- Run this script to create the database and initial setup

-- Create database
CREATE DATABASE IF NOT EXISTS lms_database;
USE lms_database;

-- Create roles table first (referenced by accounts)
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT IGNORE INTO roles (name, description, permissions) VALUES 
('admin', 'System Administrator', '["all"]'),
('lecturer', 'Teacher/Instructor', '["courses", "students", "quizzes", "materials"]'),
('student', 'Student User', '["view_courses", "take_quizzes", "view_materials"]');

-- Create accounts table (main user authentication)
CREATE TABLE IF NOT EXISTS accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255) NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- Create lecturers table (teacher profiles)
CREATE TABLE IF NOT EXISTS lecturers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    title VARCHAR(100),
    department VARCHAR(100),
    bio TEXT,
    avatar VARCHAR(255),
    hire_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Create students table (student profiles)
CREATE TABLE IF NOT EXISTS students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL UNIQUE,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    avatar VARCHAR(255),
    enrollment_date DATE DEFAULT (CURRENT_DATE),
    status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Create subjects table (courses/subjects)
CREATE TABLE IF NOT EXISTS subjects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_code VARCHAR(20) NOT NULL UNIQUE,
    subject_name VARCHAR(255) NOT NULL,
    description TEXT,
    credits INT DEFAULT 3,
    lecturer_id INT NOT NULL,
    semester VARCHAR(20),
    academic_year VARCHAR(10),
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE RESTRICT
);

-- Create course_sections table (classes)
CREATE TABLE IF NOT EXISTS course_sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    section_name VARCHAR(100) NOT NULL,
    subject_id INT NOT NULL,
    lecturer_id INT NOT NULL,
    max_students INT DEFAULT 50,
    schedule JSON,
    room VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE RESTRICT
);

-- Create student_course_sections table (enrollment junction table)
CREATE TABLE IF NOT EXISTS student_course_sections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    course_section_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('enrolled', 'completed', 'dropped', 'failed') DEFAULT 'enrolled',
    final_grade DECIMAL(5,2) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_enrollment (student_id, course_section_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_section_id) REFERENCES course_sections(id) ON DELETE CASCADE
);

-- Create chapters table (course content organization)
CREATE TABLE IF NOT EXISTS chapters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Create lectures table
CREATE TABLE IF NOT EXISTS lectures (
    id INT PRIMARY KEY AUTO_INCREMENT,
    chapter_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    duration_minutes INT,
    order_index INT DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

-- Create learning_materials table
CREATE TABLE IF NOT EXISTS learning_materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    material_type ENUM('document', 'video', 'audio', 'image', 'link') DEFAULT 'document',
    chapter_id INT,
    subject_id INT NOT NULL,
    uploaded_by INT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES lecturers(id) ON DELETE RESTRICT
);

-- Show created tables
SHOW TABLES;

-- Display database info
SELECT 'Database setup completed successfully!' as message;
SELECT COUNT(*) as role_count FROM roles;
SELECT COUNT(*) as account_count FROM accounts;

-- End of setup script 
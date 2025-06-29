-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 28, 2025 at 01:08 PM
-- Server version: 8.0.42
-- PHP Version: 7.4.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lms_database`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` datetime DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT '0',
  `email_verification_token` varchar(255) DEFAULT NULL,
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`id`, `email`, `password`, `role_id`, `is_active`, `last_login`, `email_verified`, `email_verification_token`, `password_reset_token`, `password_reset_expires`, `created_at`, `updated_at`) VALUES
(1, 'admin@lms.com', '$2a$12$A4I6lUf8JwAZwFt0hKxgE.U8X1oAt.wJyi6UBCu.KiuClIcjraTm2', 1, 1, '2025-06-28 10:59:49', 1, NULL, NULL, NULL, '2025-06-21 14:00:25', '2025-06-28 10:59:49'),
(2, 'lecturer@lms.com', '$2a$12$lr4Yfv5oYLFSUOimuUlYGOjIXXl7.CaAPTKa8WuillXMoguGOu0Cq', 2, 1, '2025-06-28 10:58:24', 1, NULL, NULL, NULL, '2025-06-21 14:00:25', '2025-06-28 10:58:24'),
(3, 'student@lms.com', '$2a$12$Nv/IqfPwnjlQ/KfZvbSVnea85bnkcPiS1vpyKFbLHSvr67SqUSQgy', 3, 1, '2025-06-28 10:01:32', 1, NULL, NULL, NULL, '2025-06-21 14:00:25', '2025-06-28 10:01:32'),
(4, 'newteacher@test.com', '$2a$12$5SO2URaMRslkE6amIidgvOmcCk3Az16QiFFS.L09f7B.RQFc0r/WS', 2, 1, NULL, 0, NULL, NULL, NULL, '2025-06-21 15:54:27', '2025-06-21 15:54:27'),
(5, 'nguyen.van.a@lms.com', '$2a$12$MlnN686ABTEBiFMJJYSL..dJhFL3aF.VUVZ3cO9IiEtHz0KgiOkii', 2, 1, NULL, 1, NULL, NULL, NULL, '2025-06-28 10:42:11', '2025-06-28 10:42:11'),
(6, 'tran.thi.b@lms.com', '$2a$12$FObjzDzhvoqolcGiMGAhHeWP7sExO/GletQ5zqyA2s.IIV1DVRTVK', 2, 1, NULL, 1, NULL, NULL, NULL, '2025-06-28 10:42:11', '2025-06-28 10:42:11'),
(7, 'le.hoang.c@lms.com', '$2a$12$eObraJFE0SOqBd//oGcuROvSe/vyCx50gTcOn4jJTJ.OFDCUx31i6', 2, 1, NULL, 1, NULL, NULL, NULL, '2025-06-28 10:42:12', '2025-06-28 10:42:12');

-- --------------------------------------------------------

--
-- Table structure for table `answers`
--

CREATE TABLE `answers` (
  `id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer_text` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT '0',
  `order_index` int NOT NULL DEFAULT '0',
  `explanation` text,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `answers`
--

INSERT INTO `answers` (`id`, `question_id`, `answer_text`, `is_correct`, `order_index`, `explanation`, `image_url`, `created_at`, `updated_at`) VALUES
(1, 1, 'M?t v? trí l?u tr? có tên', 1, 1, NULL, NULL, '2025-06-28 09:04:52', '2025-06-28 09:04:52'),
(2, 1, 'M?t ngôn ng? l?p trình', 0, 2, NULL, NULL, '2025-06-28 09:04:52', '2025-06-28 09:04:52'),
(3, 1, 'M?t ch??ng trình máy tính', 0, 3, NULL, NULL, '2025-06-28 09:04:52', '2025-06-28 09:04:52'),
(4, 2, '?úng', 0, 1, NULL, NULL, '2025-06-28 09:04:52', '2025-06-28 09:04:52'),
(5, 2, 'Sai', 1, 2, NULL, NULL, '2025-06-28 09:04:52', '2025-06-28 09:04:52');

-- --------------------------------------------------------

--
-- Table structure for table `chapters`
--

CREATE TABLE `chapters` (
  `id` int NOT NULL,
  `subject_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `order_index` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_sections`
--

CREATE TABLE `course_sections` (
  `id` int NOT NULL,
  `section_name` varchar(100) NOT NULL,
  `subject_id` int NOT NULL,
  `lecturer_id` int NOT NULL,
  `max_students` int NOT NULL DEFAULT '50',
  `schedule` json DEFAULT NULL,
  `room` varchar(50) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `course_sections`
--

INSERT INTO `course_sections` (`id`, `section_name`, `subject_id`, `lecturer_id`, `max_students`, `schedule`, `room`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Section A', 4, 3, 30, '\"Mon, Wed, Fri 10:00-11:30\"', 'Room 101', '2024-09-01', '2024-12-15', 'active', '2025-06-21 16:33:21', '2025-06-21 16:33:21'),
(2, 'Section A', 5, 3, 30, '\"Mon, Wed, Fri 10:00-11:30\"', 'Room 101', '2024-09-01', '2024-12-15', 'active', '2025-06-21 16:34:24', '2025-06-21 16:34:24');

-- --------------------------------------------------------

--
-- Table structure for table `learning_materials`
--

CREATE TABLE `learning_materials` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `material_type` enum('document','video','audio','image','link') DEFAULT 'document',
  `chapter_id` int DEFAULT NULL,
  `subject_id` int NOT NULL,
  `uploaded_by` int NOT NULL,
  `is_public` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lecturers`
--

CREATE TABLE `lecturers` (
  `id` int NOT NULL,
  `account_id` int NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `title` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `bio` text,
  `avatar` varchar(255) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `status` enum('active','inactive','on_leave') DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lecturers`
--

INSERT INTO `lecturers` (`id`, `account_id`, `first_name`, `last_name`, `phone`, `title`, `department`, `bio`, `avatar`, `hire_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'System', 'Administrator', NULL, 'Admin', 'IT', 'System administrator account for LMS management', NULL, '2025-06-21', 'active', '2025-06-21 14:00:25', '2025-06-21 14:00:25'),
(2, 2, 'John', 'Smith', NULL, 'Professor', 'Computer Science', 'Sample lecturer account for testing', NULL, '2025-06-21', 'active', '2025-06-21 14:00:25', '2025-06-21 14:00:25'),
(3, 4, 'Jane', 'Doe', '+1234567890', 'Associate Professor', 'Mathematics', 'Experienced computer science professor', NULL, '2025-06-21', 'active', '2025-06-21 15:54:28', '2025-06-21 15:54:28'),
(4, 5, 'Nguyễn Văn', 'A', NULL, 'Lecturer', 'Mathematics', NULL, NULL, '2025-06-28', 'active', '2025-06-28 10:42:11', '2025-06-28 10:42:11'),
(5, 6, 'Trần Thị', 'B', NULL, 'Lecturer', 'Physics', NULL, NULL, '2025-06-28', 'active', '2025-06-28 10:42:12', '2025-06-28 10:42:12'),
(6, 7, 'Lê Hoàng', 'C', NULL, 'Lecturer', 'Chemistry', NULL, NULL, '2025-06-28', 'active', '2025-06-28 10:42:12', '2025-06-28 10:42:12');

-- --------------------------------------------------------

--
-- Table structure for table `lectures`
--

CREATE TABLE `lectures` (
  `id` int NOT NULL,
  `chapter_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text,
  `video_url` varchar(500) DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `order_index` int NOT NULL DEFAULT '0',
  `is_published` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('multiple_choice','true_false','short_answer','essay','fill_blank') DEFAULT 'multiple_choice',
  `points` decimal(8,2) NOT NULL DEFAULT '1.00',
  `order_index` int NOT NULL DEFAULT '0',
  `explanation` text,
  `is_required` tinyint(1) DEFAULT '1',
  `image_url` varchar(500) DEFAULT NULL,
  `time_limit` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `quiz_id`, `question_text`, `question_type`, `points`, `order_index`, `explanation`, `is_required`, `image_url`, `time_limit`, `created_at`, `updated_at`) VALUES
(1, 1, 'Bi?n trong l?p trình là gì?', 'multiple_choice', 5.00, 1, NULL, 1, NULL, NULL, '2025-06-28 09:04:52', '2025-06-28 09:04:52'),
(2, 1, 'L?p trình ch? là vi?t code. ?úng hay Sai?', 'true_false', 5.00, 2, NULL, 1, NULL, NULL, '2025-06-28 09:04:52', '2025-06-28 09:04:52'),
(3, 1, 'K? tên 3 ki?u d? li?u c? b?n trong l?p trình.', 'short_answer', 10.00, 3, NULL, 1, NULL, NULL, '2025-06-28 09:04:52', '2025-06-28 09:04:52');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `subject_id` int NOT NULL,
  `course_section_id` int DEFAULT NULL,
  `lecturer_id` int NOT NULL,
  `total_points` decimal(8,2) NOT NULL DEFAULT '100.00',
  `time_limit` int DEFAULT NULL,
  `attempts_allowed` int NOT NULL DEFAULT '1',
  `shuffle_questions` tinyint(1) DEFAULT '0',
  `shuffle_answers` tinyint(1) DEFAULT '0',
  `show_results` tinyint(1) DEFAULT '1',
  `show_correct_answers` tinyint(1) DEFAULT '1',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `status` enum('draft','published','closed') DEFAULT 'draft',
  `instructions` text,
  `passing_score` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `quizzes`
--

INSERT INTO `quizzes` (`id`, `title`, `description`, `subject_id`, `course_section_id`, `lecturer_id`, `total_points`, `time_limit`, `attempts_allowed`, `shuffle_questions`, `shuffle_answers`, `show_results`, `show_correct_answers`, `start_time`, `end_time`, `status`, `instructions`, `passing_score`, `created_at`, `updated_at`) VALUES
(1, 'Bài Ki?m Tra: L?p Trình C? B?n', 'Ki?m tra ki?n th?c l?p trình c? b?n cho sinh viên', 1, NULL, 1, 20.00, 30, 1, 0, 0, 1, 1, NULL, NULL, 'draft', NULL, NULL, '2025-06-28 09:04:52', '2025-06-28 09:36:18'),
(2, 'Test Quiz', 'Sample quiz for testing', 1, NULL, 1, 20.00, 30, 1, 0, 0, 1, 1, NULL, NULL, 'published', NULL, NULL, '2025-06-28 09:05:01', '2025-06-28 09:05:01'),
(3, 'Test Quiz 1751102305704', 'Auto-generated test quiz for API testing', 1, NULL, 1, 10.00, 30, 1, 0, 0, 1, 1, NULL, NULL, 'draft', NULL, NULL, '2025-06-28 09:18:25', '2025-06-28 09:18:25'),
(4, 'Test Quiz 1751102656351', 'Auto-generated test quiz for API testing', 1, NULL, 1, 10.00, 30, 1, 0, 0, 1, 1, NULL, NULL, 'draft', NULL, NULL, '2025-06-28 09:24:16', '2025-06-28 09:24:16'),
(5, 'Test Quiz 1751102660095', 'Auto-generated test quiz for API testing', 1, NULL, 1, 10.00, 30, 1, 0, 0, 1, 1, NULL, NULL, 'draft', NULL, NULL, '2025-06-28 09:24:20', '2025-06-28 09:24:20'),
(6, 'Test Quiz 1751102789192', 'Auto-generated test quiz for API testing', 1, NULL, 1, 10.00, 30, 1, 0, 0, 1, 1, NULL, NULL, 'draft', NULL, NULL, '2025-06-28 09:26:29', '2025-06-28 09:26:29'),
(7, 'Test Quiz 1751103394324', 'Auto-generated test quiz for API testing', 1, NULL, 1, 10.00, 30, 1, 0, 0, 1, 1, NULL, NULL, 'draft', NULL, NULL, '2025-06-28 09:36:34', '2025-06-28 09:36:34');

-- --------------------------------------------------------

--
-- Table structure for table `responses`
--

CREATE TABLE `responses` (
  `id` int NOT NULL,
  `submission_id` int NOT NULL,
  `question_id` int NOT NULL,
  `answer_id` int DEFAULT NULL,
  `answer_text` text,
  `is_correct` tinyint(1) DEFAULT NULL,
  `points_earned` decimal(8,2) DEFAULT '0.00',
  `is_flagged` tinyint(1) DEFAULT '0',
  `time_spent` int DEFAULT NULL,
  `attempt_count` int DEFAULT '1',
  `graded_by` int DEFAULT NULL,
  `grader_feedback` text,
  `graded_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text,
  `permissions` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `permissions`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'System Administrator with full access', '[\"all\"]', '2025-06-21 14:00:25', '2025-06-21 14:00:25'),
(2, 'lecturer', 'Teacher/Instructor with course management access', '[\"courses\", \"students\", \"quizzes\", \"materials\"]', '2025-06-21 14:00:25', '2025-06-21 14:00:25'),
(3, 'student', 'Student with learning access', '[\"view_courses\", \"take_quizzes\", \"view_materials\"]', '2025-06-21 14:00:25', '2025-06-21 14:00:25');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int NOT NULL,
  `account_id` int NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `address` text,
  `avatar` varchar(255) DEFAULT NULL,
  `enrollment_date` date DEFAULT NULL,
  `status` enum('active','inactive','graduated','suspended') DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `account_id`, `student_id`, `first_name`, `last_name`, `phone`, `date_of_birth`, `address`, `avatar`, `enrollment_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 'STU001', 'Jane', 'Doe', '123-456-7890', NULL, '123 Student St, University City', NULL, '2025-06-21', 'active', '2025-06-21 14:00:26', '2025-06-21 14:00:26');

-- --------------------------------------------------------

--
-- Table structure for table `student_course_sections`
--

CREATE TABLE `student_course_sections` (
  `id` int NOT NULL,
  `student_id` int NOT NULL,
  `course_section_id` int NOT NULL,
  `enrollment_date` datetime NOT NULL,
  `status` enum('enrolled','completed','dropped','failed') DEFAULT 'enrolled',
  `final_grade` decimal(5,2) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int NOT NULL,
  `subject_code` varchar(20) NOT NULL,
  `subject_name` varchar(255) NOT NULL,
  `description` text,
  `credits` int NOT NULL DEFAULT '3',
  `lecturer_id` int NOT NULL,
  `semester` varchar(20) DEFAULT NULL,
  `academic_year` varchar(10) DEFAULT NULL,
  `status` enum('active','inactive','archived') DEFAULT 'active',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `subject_code`, `subject_name`, `description`, `credits`, `lecturer_id`, `semester`, `academic_year`, `status`, `created_at`, `updated_at`) VALUES
(1, 'TEST101', 'Test Course', 'A test course for Phase 5', 3, 3, 'fall', '2024-2025', 'active', '2025-06-21 16:26:26', '2025-06-21 16:26:26'),
(4, 'TEST1750523601841', 'Test Course', 'A test course for Phase 5', 3, 3, 'fall', '2024-2025', 'active', '2025-06-21 16:33:21', '2025-06-21 16:33:21'),
(5, 'TEST1750523664759', 'Test Course', 'A test course for Phase 5', 3, 3, 'fall', '2024-2025', 'active', '2025-06-21 16:34:24', '2025-06-21 16:34:24'),
(7, 'LẬPTRÌNH', 'lập trình', 'abc', 3, 6, 'fall', '2025-2026', 'active', '2025-06-28 11:06:57', '2025-06-28 11:06:57');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `student_id` int NOT NULL,
  `attempt_number` int NOT NULL DEFAULT '1',
  `started_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `submitted_at` datetime DEFAULT NULL,
  `time_spent` int DEFAULT NULL,
  `score` decimal(8,2) DEFAULT NULL,
  `max_score` decimal(8,2) DEFAULT NULL,
  `percentage` decimal(5,2) DEFAULT NULL,
  `status` enum('in_progress','submitted','graded','expired') DEFAULT 'in_progress',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `is_flagged` tinyint(1) DEFAULT '0',
  `flagged_reason` text,
  `graded_at` datetime DEFAULT NULL,
  `graded_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `accounts_email` (`email`),
  ADD KEY `accounts_role_id` (`role_id`);

--
-- Indexes for table `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `answers_question_id` (`question_id`),
  ADD KEY `answers_question_id_order_index` (`question_id`,`order_index`),
  ADD KEY `answers_is_correct` (`is_correct`);

--
-- Indexes for table `chapters`
--
ALTER TABLE `chapters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chapters_subject_id` (`subject_id`),
  ADD KEY `chapters_subject_id_order_index` (`subject_id`,`order_index`),
  ADD KEY `chapters_status` (`status`);

--
-- Indexes for table `course_sections`
--
ALTER TABLE `course_sections`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_sections_subject_id` (`subject_id`),
  ADD KEY `course_sections_lecturer_id` (`lecturer_id`),
  ADD KEY `course_sections_status` (`status`),
  ADD KEY `course_sections_start_date_end_date` (`start_date`,`end_date`);

--
-- Indexes for table `learning_materials`
--
ALTER TABLE `learning_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `learning_materials_subject_id` (`subject_id`),
  ADD KEY `learning_materials_chapter_id` (`chapter_id`),
  ADD KEY `learning_materials_uploaded_by` (`uploaded_by`),
  ADD KEY `learning_materials_material_type` (`material_type`),
  ADD KEY `learning_materials_is_public` (`is_public`);

--
-- Indexes for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_id` (`account_id`),
  ADD UNIQUE KEY `lecturers_account_id` (`account_id`),
  ADD KEY `lecturers_status` (`status`),
  ADD KEY `lecturers_department` (`department`);

--
-- Indexes for table `lectures`
--
ALTER TABLE `lectures`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lectures_chapter_id` (`chapter_id`),
  ADD KEY `lectures_chapter_id_order_index` (`chapter_id`,`order_index`),
  ADD KEY `lectures_is_published` (`is_published`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `questions_quiz_id` (`quiz_id`),
  ADD KEY `questions_quiz_id_order_index` (`quiz_id`,`order_index`),
  ADD KEY `questions_question_type` (`question_type`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quizzes_subject_id` (`subject_id`),
  ADD KEY `quizzes_course_section_id` (`course_section_id`),
  ADD KEY `quizzes_lecturer_id` (`lecturer_id`),
  ADD KEY `quizzes_status` (`status`),
  ADD KEY `quizzes_start_time_end_time` (`start_time`,`end_time`);

--
-- Indexes for table `responses`
--
ALTER TABLE `responses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `responses_submission_id_question_id` (`submission_id`,`question_id`),
  ADD KEY `graded_by` (`graded_by`),
  ADD KEY `responses_submission_id` (`submission_id`),
  ADD KEY `responses_question_id` (`question_id`),
  ADD KEY `responses_answer_id` (`answer_id`),
  ADD KEY `responses_is_correct` (`is_correct`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `roles_name` (`name`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `account_id` (`account_id`),
  ADD UNIQUE KEY `student_id` (`student_id`),
  ADD UNIQUE KEY `students_account_id` (`account_id`),
  ADD UNIQUE KEY `students_student_id` (`student_id`),
  ADD KEY `students_status` (`status`);

--
-- Indexes for table `student_course_sections`
--
ALTER TABLE `student_course_sections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_course_sections_course_section_id_student_id_unique` (`student_id`,`course_section_id`),
  ADD UNIQUE KEY `unique_enrollment` (`student_id`,`course_section_id`),
  ADD KEY `student_course_sections_student_id` (`student_id`),
  ADD KEY `student_course_sections_course_section_id` (`course_section_id`),
  ADD KEY `student_course_sections_status` (`status`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subject_code` (`subject_code`),
  ADD UNIQUE KEY `subjects_subject_code` (`subject_code`),
  ADD KEY `subjects_lecturer_id` (`lecturer_id`),
  ADD KEY `subjects_status` (`status`),
  ADD KEY `subjects_semester_academic_year` (`semester`,`academic_year`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `graded_by` (`graded_by`),
  ADD KEY `submissions_quiz_id` (`quiz_id`),
  ADD KEY `submissions_student_id` (`student_id`),
  ADD KEY `submissions_quiz_id_student_id` (`quiz_id`,`student_id`),
  ADD KEY `submissions_status` (`status`),
  ADD KEY `submissions_submitted_at` (`submitted_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `answers`
--
ALTER TABLE `answers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `chapters`
--
ALTER TABLE `chapters`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_sections`
--
ALTER TABLE `course_sections`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `learning_materials`
--
ALTER TABLE `learning_materials`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lecturers`
--
ALTER TABLE `lecturers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `lectures`
--
ALTER TABLE `lectures`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `responses`
--
ALTER TABLE `responses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student_course_sections`
--
ALTER TABLE `student_course_sections`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `submissions`
--
ALTER TABLE `submissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `answers_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chapters`
--
ALTER TABLE `chapters`
  ADD CONSTRAINT `chapters_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `course_sections`
--
ALTER TABLE `course_sections`
  ADD CONSTRAINT `course_sections_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `course_sections_ibfk_2` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `learning_materials`
--
ALTER TABLE `learning_materials`
  ADD CONSTRAINT `learning_materials_ibfk_1` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `learning_materials_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `learning_materials_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD CONSTRAINT `lecturers_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `lectures`
--
ALTER TABLE `lectures`
  ADD CONSTRAINT `lectures_ibfk_1` FOREIGN KEY (`chapter_id`) REFERENCES `chapters` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`course_section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quizzes_ibfk_3` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `responses`
--
ALTER TABLE `responses`
  ADD CONSTRAINT `responses_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `responses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `responses_ibfk_3` FOREIGN KEY (`answer_id`) REFERENCES `answers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `responses_ibfk_4` FOREIGN KEY (`graded_by`) REFERENCES `lecturers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student_course_sections`
--
ALTER TABLE `student_course_sections`
  ADD CONSTRAINT `student_course_sections_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `student_course_sections_ibfk_2` FOREIGN KEY (`course_section_id`) REFERENCES `course_sections` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_ibfk_3` FOREIGN KEY (`graded_by`) REFERENCES `lecturers` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

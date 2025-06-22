// Input Validation Middleware
// Request body, query, and params validation using Joi

const Joi = require('joi');

// Generic validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: errorMessages
            });
        }
        
        next();
    };
};

// Query validation middleware
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query);
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                status: 'error',
                message: 'Query validation failed',
                errors: errorMessages
            });
        }
        
        next();
    };
};

// Params validation middleware
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params);
        
        if (error) {
            const errorMessages = error.details.map(detail => detail.message);
            return res.status(400).json({
                status: 'error',
                message: 'Parameters validation failed',
                errors: errorMessages
            });
        }
        
        next();
    };
};

// Common validation schemas
const commonSchemas = {
    id: Joi.object({
        id: Joi.number().integer().positive().required()
    }),
    
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        sort: Joi.string().optional(),
        order: Joi.string().valid('asc', 'desc').default('asc')
    }),
    
    // Teacher-specific pagination with additional filters
    teacherPagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        department: Joi.string().optional(),
        title: Joi.string().optional(),
        sort: Joi.string().valid('created_at', 'first_name', 'last_name', 'email').default('created_at'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    
    // Student-specific pagination with additional filters
    studentPagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        class_id: Joi.number().integer().positive().optional(),
        sort: Joi.string().valid('created_at', 'first_name', 'last_name', 'student_id').default('created_at'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    
    // Course-specific pagination with filters
    coursePagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        lecturer_id: Joi.number().integer().positive().optional(),
        department: Joi.string().optional(),
        sort: Joi.string().valid('created_at', 'subject_name', 'subject_code', 'credits').default('created_at'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    
    // Class-specific pagination with filters
    classPagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        subject_id: Joi.number().integer().positive().optional(),
        lecturer_id: Joi.number().integer().positive().optional(),
        sort: Joi.string().valid('created_at', 'section_name', 'start_date').default('created_at'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    optionalPassword: Joi.string().min(6).optional()
};

// Authentication validation schemas
const authSchemas = {
    login: Joi.object({
        email: commonSchemas.email,
        password: commonSchemas.password,
        remember_me: Joi.boolean().optional()
    }),
    
    changePassword: Joi.object({
        current_password: commonSchemas.password,
        new_password: commonSchemas.password,
        confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
    }),
    
    forgotPassword: Joi.object({
        email: commonSchemas.email
    }),
    
    resetPassword: Joi.object({
        token: Joi.string().required(),
        new_password: commonSchemas.password,
        confirm_password: Joi.string().valid(Joi.ref('new_password')).required()
    })
};

// User validation schemas
const userSchemas = {
    createTeacher: Joi.object({
        email: commonSchemas.email,
        password: commonSchemas.password,
        first_name: Joi.string().min(2).max(50).required(),
        last_name: Joi.string().min(2).max(50).required(),
        phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
        title: Joi.string().max(100).optional(),
        department: Joi.string().max(100).optional(),
        bio: Joi.string().max(1000).optional()
    }),
    
    updateTeacher: Joi.object({
        email: Joi.string().email().optional(),
        first_name: Joi.string().min(2).max(50).optional(),
        last_name: Joi.string().min(2).max(50).optional(),
        phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
        title: Joi.string().max(100).optional(),
        department: Joi.string().max(100).optional(),
        bio: Joi.string().max(1000).optional(),
        is_active: Joi.boolean().optional()
    }),
    
    createStudent: Joi.object({
        email: commonSchemas.email,
        password: commonSchemas.password,
        student_id: Joi.string().min(3).max(20).required(),
        first_name: Joi.string().min(2).max(50).required(),
        last_name: Joi.string().min(2).max(50).required(),
        phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
        date_of_birth: Joi.date().optional(),
        address: Joi.string().max(500).optional()
    }),
    
    updateStudent: Joi.object({
        email: Joi.string().email().optional(),
        student_id: Joi.string().min(3).max(20).optional(),
        first_name: Joi.string().min(2).max(50).optional(),
        last_name: Joi.string().min(2).max(50).optional(),
        phone: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
        date_of_birth: Joi.date().optional(),
        address: Joi.string().max(500).optional(),
        is_active: Joi.boolean().optional()
    })
};

// Course validation schemas
const courseSchemas = {
    createCourse: Joi.object({
        subject_name: Joi.string().min(3).max(255).required(),
        description: Joi.string().max(2000).optional(),
        subject_code: Joi.string().min(3).max(20).required(),
        lecturer_id: Joi.number().integer().positive().required(),
        credits: Joi.number().integer().min(1).max(10).required(),
        semester: Joi.string().valid('spring', 'summer', 'fall', 'winter').optional(),
        academic_year: Joi.string().pattern(/^\d{4}-\d{4}$/).optional()
    }),
    
    updateCourse: Joi.object({
        subject_name: Joi.string().min(3).max(255).optional(),
        description: Joi.string().max(2000).optional(),
        subject_code: Joi.string().min(3).max(20).optional(),
        lecturer_id: Joi.number().integer().positive().optional(),
        credits: Joi.number().integer().min(1).max(10).optional(),
        semester: Joi.string().valid('spring', 'summer', 'fall', 'winter').optional(),
        academic_year: Joi.string().pattern(/^\d{4}-\d{4}$/).optional()
    }),
    
    createClass: Joi.object({
        subject_id: Joi.number().integer().positive().required(),
        lecturer_id: Joi.number().integer().positive().required(),
        section_name: Joi.string().min(1).max(50).required(),
        max_students: Joi.number().integer().min(1).max(500).required(),
        start_date: Joi.date().required(),
        end_date: Joi.date().greater(Joi.ref('start_date')).required(),
        schedule: Joi.string().max(200).optional(),
        room: Joi.string().max(100).optional()
    }),
    
    updateClass: Joi.object({
        lecturer_id: Joi.number().integer().positive().optional(),
        section_name: Joi.string().min(1).max(50).optional(),
        max_students: Joi.number().integer().min(1).max(500).optional(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        schedule: Joi.string().max(200).optional(),
        room: Joi.string().max(100).optional()
    }),
    
    enrollStudents: Joi.object({
        student_ids: Joi.array().items(Joi.number().integer().positive()).min(1).max(50).required()
    }),
    
    bulkEnrollment: Joi.object({
        enrollments: Joi.array().items(
            Joi.object({
                student_id: Joi.number().integer().positive().required(),
                course_section_id: Joi.number().integer().positive().required()
            })
        ).min(1).max(100).required()
    }),
    
    // Parameter validation for enrollment routes
    enrollmentParams: Joi.object({
        id: Joi.number().integer().positive().required(),
        studentId: Joi.number().integer().positive().required()
    })
};

// Lecture validation schemas
const lectureSchemas = {
    createLecture: Joi.object({
        chapter_id: Joi.number().integer().positive().required(),
        title: Joi.string().min(3).max(255).required(),
        content: Joi.string().max(10000).optional(),
        video_url: Joi.string().uri().optional(),
        duration_minutes: Joi.number().integer().min(1).max(480).optional(),
        order_index: Joi.number().integer().min(0).optional(),
        is_published: Joi.boolean().optional()
    }),
    
    updateLecture: Joi.object({
        chapter_id: Joi.number().integer().positive().optional(),
        title: Joi.string().min(3).max(255).optional(),
        content: Joi.string().max(10000).optional(),
        video_url: Joi.string().uri().optional(),
        duration_minutes: Joi.number().integer().min(1).max(480).optional(),
        order_index: Joi.number().integer().min(0).optional(),
        is_published: Joi.boolean().optional()
    }),
    
    createChapter: Joi.object({
        subject_id: Joi.number().integer().positive().required(),
        title: Joi.string().min(3).max(255).required(),
        description: Joi.string().max(2000).optional(),
        order_index: Joi.number().integer().min(0).optional(),
        status: Joi.string().valid('active', 'inactive').optional()
    }),
    
    updateChapter: Joi.object({
        subject_id: Joi.number().integer().positive().optional(),
        title: Joi.string().min(3).max(255).optional(),
        description: Joi.string().max(2000).optional(),
        order_index: Joi.number().integer().min(0).optional(),
        status: Joi.string().valid('active', 'inactive').optional()
    }),
    
    lecturePermissions: Joi.object({
        is_published: Joi.boolean().optional(),
        visibility: Joi.string().valid('public', 'private').optional()
    }),
    
    // Lecture-specific pagination with filters
    lecturePagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        chapter_id: Joi.number().integer().positive().optional(),
        is_published: Joi.string().valid('true', 'false').optional(),
        sort: Joi.string().valid('created_at', 'title', 'order_index').default('order_index'),
        order: Joi.string().valid('asc', 'desc').default('asc')
    }),
    
    // Chapter-specific pagination with filters
    chapterPagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        subject_id: Joi.number().integer().positive().optional(),
        status: Joi.string().valid('active', 'inactive').optional(),
        sort: Joi.string().valid('created_at', 'title', 'order_index').default('order_index'),
        order: Joi.string().valid('asc', 'desc').default('asc')
    }),
    
    // My lectures pagination with filters
    myLecturesPagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        status: Joi.string().valid('published', 'draft').optional(),
        subject_id: Joi.number().integer().positive().optional(),
        sort: Joi.string().valid('created_at', 'updated_at', 'title').default('updated_at'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    })
};

// Material validation schemas
const materialSchemas = {
    createMaterial: Joi.object({
        title: Joi.string().min(3).max(255).required(),
        description: Joi.string().max(2000).optional(),
        subject_id: Joi.number().integer().positive().required(),
        chapter_id: Joi.number().integer().positive().optional(),
        material_type: Joi.string().valid('document', 'video', 'audio', 'image', 'link').optional(),
        is_public: Joi.boolean().optional()
    }),
    
    updateMaterial: Joi.object({
        title: Joi.string().min(3).max(255).optional(),
        description: Joi.string().max(2000).optional(),
        material_type: Joi.string().valid('document', 'video', 'audio', 'image', 'link').optional(),
        is_public: Joi.boolean().optional()
    }),
    
    uploadMaterial: Joi.object({
        title: Joi.string().min(3).max(255).optional(),
        description: Joi.string().max(2000).optional(),
        subject_id: Joi.number().integer().positive().required(),
        chapter_id: Joi.number().integer().positive().optional(),
        material_type: Joi.string().valid('document', 'video', 'audio', 'image', 'link').optional(),
        is_public: Joi.boolean().optional()
    }),
    
    uploadMultiple: Joi.object({
        subject_id: Joi.number().integer().positive().required(),
        chapter_id: Joi.number().integer().positive().optional(),
        is_public: Joi.boolean().optional()
    }),
    
    // Material-specific pagination with filters
    materialPagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        search: Joi.string().allow('').optional(),
        subject_id: Joi.number().integer().positive().optional(),
        chapter_id: Joi.number().integer().positive().optional(),
        material_type: Joi.string().valid('document', 'video', 'audio', 'image', 'link').optional(),
        is_public: Joi.string().valid('true', 'false').optional(),
        sort: Joi.string().valid('created_at', 'title', 'file_size').default('created_at'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    }),
    
    // Search materials
    searchMaterials: Joi.object({
        query: Joi.string().min(1).required(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    }),
    
    // Recent materials
    recentMaterials: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        days: Joi.number().integer().min(1).max(365).default(7)
    }),
    
    // Materials by type
    materialsByType: Joi.object({
        type: Joi.string().valid('document', 'video', 'audio', 'image', 'link').required(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10)
    })
};

// Quiz validation schemas
const quizSchemas = {
    createQuiz: Joi.object({
        title: Joi.string().min(3).max(255).required(),
        description: Joi.string().max(2000).optional(),
        subject_id: Joi.number().integer().positive().required(),
        course_section_id: Joi.number().integer().positive().optional(),
        time_limit: Joi.number().integer().min(1).max(480).optional(), // in minutes
        max_attempts: Joi.number().integer().min(1).max(10).default(1),
        passing_score: Joi.number().min(0).max(100).default(70),
        is_published: Joi.boolean().default(false),
        start_date: Joi.date().optional(),
        end_date: Joi.date().when('start_date', {
            is: Joi.exist(),
            then: Joi.date().greater(Joi.ref('start_date')),
            otherwise: Joi.date()
        }).optional(),
        shuffle_questions: Joi.boolean().default(false),
        show_results: Joi.boolean().default(true),
        instructions: Joi.string().max(1000).optional()
    }),
    
    updateQuiz: Joi.object({
        title: Joi.string().min(3).max(255).optional(),
        description: Joi.string().max(2000).optional(),
        time_limit: Joi.number().integer().min(1).max(480).optional(),
        max_attempts: Joi.number().integer().min(1).max(10).optional(),
        passing_score: Joi.number().min(0).max(100).optional(),
        is_published: Joi.boolean().optional(),
        start_date: Joi.date().optional(),
        end_date: Joi.date().optional(),
        shuffle_questions: Joi.boolean().optional(),
        show_results: Joi.boolean().optional(),
        instructions: Joi.string().max(1000).optional()
    }),
    
    createQuestion: Joi.object({
        quiz_id: Joi.number().integer().positive().required(),
        question_text: Joi.string().min(10).max(2000).required(),
        question_type: Joi.string().valid('multiple_choice', 'true_false', 'essay', 'short_answer').required(),
        points: Joi.number().min(1).max(100).default(1),
        order_index: Joi.number().integer().min(0).optional(),
        is_required: Joi.boolean().default(true),
        explanation: Joi.string().max(1000).optional(),
        time_limit: Joi.number().integer().min(1).max(60).optional() // per question time limit in minutes
    }),
    
    createAnswer: Joi.object({
        question_id: Joi.number().integer().positive().required(),
        answer_text: Joi.string().min(1).max(1000).required(),
        is_correct: Joi.boolean().required(),
        order_index: Joi.number().integer().min(0).optional()
    }),
    
    submitAnswer: Joi.object({
        question_id: Joi.number().integer().positive().required(),
        answer_text: Joi.string().max(5000).optional(),
        selected_answer_ids: Joi.array().items(Joi.number().integer().positive()).optional()
    }).or('answer_text', 'selected_answer_ids'),
    
    // Quiz attempt validation
    quizAttemptPagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        status: Joi.string().valid('in_progress', 'completed', 'submitted').optional(),
        quiz_id: Joi.number().integer().positive().optional(),
        sort: Joi.string().valid('created_at', 'updated_at', 'score').default('created_at'),
        order: Joi.string().valid('asc', 'desc').default('desc')
    })
};

// File upload validation schemas
const fileSchemas = {
    uploadValidation: Joi.object({
        title: Joi.string().min(3).max(255).optional(),
        description: Joi.string().max(2000).optional(),
        subject_id: Joi.number().integer().positive().optional(),
        chapter_id: Joi.number().integer().positive().optional(),
        is_public: Joi.boolean().default(false),
        file_type: Joi.string().valid('document', 'image', 'video', 'audio').optional(),
        tags: Joi.array().items(Joi.string().max(50)).max(10).optional()
    }),
    
    // Avatar upload validation
    avatarUpload: Joi.object({
        crop_x: Joi.number().min(0).optional(),
        crop_y: Joi.number().min(0).optional(),
        crop_width: Joi.number().min(50).max(2000).optional(),
        crop_height: Joi.number().min(50).max(2000).optional()
    })
};

// Business logic validation
const businessLogicValidation = {
    // Enrollment capacity validation
    validateEnrollmentCapacity: async (courseSectionId, newStudentCount = 1) => {
        try {
            const CourseSection = require('../models').CourseSection;
            const StudentCourseSection = require('../models').StudentCourseSection;
            
            const courseSection = await CourseSection.findByPk(courseSectionId);
            if (!courseSection) {
                throw new Error('Course section not found');
            }
            
            const currentEnrollment = await StudentCourseSection.count({
                where: { course_section_id: courseSectionId }
            });
            
            if (currentEnrollment + newStudentCount > courseSection.max_students) {
                throw new Error(`Enrollment would exceed capacity. Current: ${currentEnrollment}, Max: ${courseSection.max_students}`);
            }
            
            return true;
        } catch (error) {
            throw error;
        }
    },
    
    // Quiz attempt validation
    validateQuizAttempt: async (quizId, userId) => {
        try {
            const Quiz = require('../models').Quiz;
            const Submission = require('../models').Submission;
            
            const quiz = await Quiz.findByPk(quizId);
            if (!quiz) {
                throw new Error('Quiz not found');
            }
            
            if (!quiz.is_published) {
                throw new Error('Quiz is not published');
            }
            
            // Check if quiz is within date range
            const now = new Date();
            if (quiz.start_date && now < quiz.start_date) {
                throw new Error('Quiz has not started yet');
            }
            
            if (quiz.end_date && now > quiz.end_date) {
                throw new Error('Quiz has ended');
            }
            
            // Check attempt count
            const attemptCount = await Submission.count({
                where: { 
                    quiz_id: quizId, 
                    student_id: userId 
                }
            });
            
            if (attemptCount >= quiz.max_attempts) {
                throw new Error('Maximum attempts exceeded');
            }
            
            return true;
        } catch (error) {
            throw error;
        }
    },
    
    // Course access validation
    validateCourseAccess: async (courseId, userId, userRole) => {
        try {
            if (userRole === 'admin') {
                return true; // Admins have access to all courses
            }
            
            if (userRole === 'lecturer') {
                const Subject = require('../models').Subject;
                const course = await Subject.findByPk(courseId);
                if (course && course.lecturer_id === userId) {
                    return true;
                }
            }
            
            if (userRole === 'student') {
                const StudentCourseSection = require('../models').StudentCourseSection;
                const CourseSection = require('../models').CourseSection;
                
                const enrollment = await StudentCourseSection.findOne({
                    include: [{
                        model: CourseSection,
                        where: { subject_id: courseId }
                    }],
                    where: { student_id: userId }
                });
                
                if (enrollment) {
                    return true;
                }
            }
            
            throw new Error('Access denied to this course');
        } catch (error) {
            throw error;
        }
    }
};

// Enhanced validation middleware with business logic
const validateWithBusinessLogic = (schema, businessLogicFn = null) => {
    return async (req, res, next) => {
        try {
            // First, validate the schema
            const { error } = schema.validate(req.body);
            if (error) {
                const errorMessages = error.details.map(detail => detail.message);
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errorMessages,
                    code: 'VALIDATION_FAILED'
                });
            }
            
            // Then, run business logic validation if provided
            if (businessLogicFn) {
                await businessLogicFn(req, res);
            }
            
            next();
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: error.message,
                code: 'BUSINESS_LOGIC_VALIDATION_FAILED'
            });
        }
    };
};

// File validation middleware
const validateFileUpload = (allowedTypes = [], maxSize = 50 * 1024 * 1024) => {
    return (req, res, next) => {
        if (!req.file && !req.files) {
            return res.status(400).json({
                status: 'error',
                message: 'No file uploaded',
                code: 'NO_FILE_UPLOADED'
            });
        }
        
        const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
        
        for (const file of files) {
            // Check file size
            if (file.size > maxSize) {
                return res.status(400).json({
                    status: 'error',
                    message: `File ${file.originalname} exceeds maximum size of ${maxSize / (1024 * 1024)}MB`,
                    code: 'FILE_TOO_LARGE'
                });
            }
            
            // Check file type if specified
            if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
                return res.status(400).json({
                    status: 'error',
                    message: `File type ${file.mimetype} is not allowed`,
                    code: 'INVALID_FILE_TYPE'
                });
            }
        }
        
        next();
    };
};

// Security validation middleware
const validateSecureInput = (req, res, next) => {
    const { logSecurity } = require('../services/loggerService');
    
    // Check for potentially malicious patterns
    const maliciousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /vbscript:/gi,
        /onload=/gi,
        /onerror=/gi
    ];
    
    const checkValue = (value, path = '') => {
        if (typeof value === 'string') {
            for (const pattern of maliciousPatterns) {
                if (pattern.test(value)) {
                    logSecurity.securityViolation(
                        'MALICIOUS_INPUT_DETECTED',
                        req.ip,
                        req.get('User-Agent'),
                        { path, value: value.substring(0, 100) }
                    );
                    
                    return false;
                }
            }
        } else if (typeof value === 'object' && value !== null) {
            for (const [key, val] of Object.entries(value)) {
                if (!checkValue(val, path ? `${path}.${key}` : key)) {
                    return false;
                }
            }
        }
        return true;
    };
    
    // Check all input sources
    const inputSources = [
        { data: req.body, name: 'body' },
        { data: req.query, name: 'query' },
        { data: req.params, name: 'params' }
    ];
    
    for (const source of inputSources) {
        if (!checkValue(source.data, source.name)) {
            return res.status(400).json({
                status: 'error',
                message: 'Malicious input detected',
                code: 'MALICIOUS_INPUT_DETECTED'
            });
        }
    }
    
    next();
};

module.exports = {
    validate,
    validateQuery,
    validateParams,
    validateWithBusinessLogic,
    validateFileUpload,
    validateSecureInput,
    commonSchemas,
    authSchemas,
    userSchemas,
    courseSchemas,
    lectureSchemas,
    materialSchemas,
    quizSchemas,
    fileSchemas,
    businessLogicValidation
}; 
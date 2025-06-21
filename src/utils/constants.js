// Application Constants
// Centralized constants and configuration

const constants = {
    // User roles
    USER_ROLES: {
        ADMIN: 'admin',
        LECTURER: 'lecturer',
        STUDENT: 'student'
    },

    // User status
    USER_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended',
        GRADUATED: 'graduated',
        ON_LEAVE: 'on_leave'
    },

    // Quiz status
    QUIZ_STATUS: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        CLOSED: 'closed'
    },

    // Question types
    QUESTION_TYPES: {
        MULTIPLE_CHOICE: 'multiple_choice',
        TRUE_FALSE: 'true_false',
        SHORT_ANSWER: 'short_answer',
        ESSAY: 'essay',
        FILL_IN_BLANK: 'fill_in_blank'
    },

    // Course status
    COURSE_STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        ARCHIVED: 'archived'
    },

    // Class status
    CLASS_STATUS: {
        ACTIVE: 'active',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },

    // Material types
    MATERIAL_TYPES: {
        DOCUMENT: 'document',
        VIDEO: 'video',
        AUDIO: 'audio',
        IMAGE: 'image',
        LINK: 'link'
    },

    // File types
    ALLOWED_FILE_TYPES: {
        IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        DOCUMENTS: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
        PRESENTATIONS: ['.ppt', '.pptx'],
        SPREADSHEETS: ['.xls', '.xlsx', '.csv'],
        ARCHIVES: ['.zip', '.rar', '.7z'],
        VIDEOS: ['.mp4', '.avi', '.mov', '.wmv', '.flv'],
        AUDIO: ['.mp3', '.wav', '.ogg', '.m4a']
    },

    // File size limits (in MB)
    FILE_SIZE_LIMITS: {
        AVATAR: 5,
        DOCUMENT: 50,
        VIDEO: 500,
        AUDIO: 100,
        IMAGE: 10
    },

    // Pagination defaults
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },

    // Grade scales
    GRADE_SCALE: {
        A: { min: 90, max: 100 },
        B: { min: 80, max: 89 },
        C: { min: 70, max: 79 },
        D: { min: 60, max: 69 },
        F: { min: 0, max: 59 }
    },

    // Time constants
    TIME: {
        MINUTES_PER_HOUR: 60,
        HOURS_PER_DAY: 24,
        DAYS_PER_WEEK: 7,
        WEEKS_PER_SEMESTER: 16
    },

    // HTTP status codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        UNPROCESSABLE_ENTITY: 422,
        INTERNAL_SERVER_ERROR: 500
    },

    // Response messages
    MESSAGES: {
        SUCCESS: 'Operation successful',
        CREATED: 'Resource created successfully',
        UPDATED: 'Resource updated successfully',
        DELETED: 'Resource deleted successfully',
        NOT_FOUND: 'Resource not found',
        UNAUTHORIZED: 'Unauthorized access',
        FORBIDDEN: 'Access forbidden',
        VALIDATION_ERROR: 'Validation failed',
        INTERNAL_ERROR: 'Internal server error'
    },

    // Academic periods
    SEMESTERS: ['spring', 'summer', 'fall', 'winter'],

    // Days of week
    DAYS_OF_WEEK: [
        'monday', 'tuesday', 'wednesday', 
        'thursday', 'friday', 'saturday', 'sunday'
    ],

    // Time slots
    TIME_SLOTS: [
        '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
        '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
        '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00'
    ],

    // Default values
    DEFAULTS: {
        COURSE_CREDITS: 3,
        CLASS_MAX_STUDENTS: 50,
        QUIZ_TIME_LIMIT: 60, // minutes
        QUIZ_ATTEMPTS_ALLOWED: 1,
        PASSWORD_MIN_LENGTH: 8
    },

    // Regular expressions
    REGEX: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^[\+]?[1-9][\d]{0,15}$/,
        STUDENT_ID: /^[A-Za-z0-9]{6,12}$/,
        SUBJECT_CODE: /^[A-Z]{2,4}[-]?[0-9]{2,4}$/,
        PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    },

    // Environment types
    ENVIRONMENTS: {
        DEVELOPMENT: 'development',
        PRODUCTION: 'production',
        TEST: 'test'
    }
};

module.exports = constants; 
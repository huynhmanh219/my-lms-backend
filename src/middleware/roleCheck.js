// Role-based Access Control Middleware
// Checks user roles and permissions

const { AppError } = require('./errorHandler');
const { CourseSection, StudentCourseSection } = require('../models');

// Check if user has required role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        // Convert single role to array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        // Check if user has one of the required roles
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Check if user is admin
const requireAdmin = requireRole(['admin']);

// Check if user is lecturer
const requireLecturer = requireRole(['lecturer', 'admin']);

// Check if user is student
const requireStudent = requireRole(['student', 'lecturer', 'admin']);

// Check if user owns the resource or is admin
const requireOwnershipOrAdmin = (getResourceOwnerFn) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new AppError('Authentication required', 401));
            }

            // Admin can access everything
            if (req.user.role === 'admin') {
                return next();
            }

            // Get resource owner ID
            let ownerId;
            if (typeof getResourceOwnerFn === 'function') {
                ownerId = await getResourceOwnerFn(req);
            } else if (typeof getResourceOwnerFn === 'string') {
                ownerId = req.params[getResourceOwnerFn];
            } else {
                ownerId = req.params.id;
            }

            // Check ownership
            if (req.user.id !== parseInt(ownerId)) {
                return next(new AppError('Access denied', 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

// Check if user is lecturer of the course
const requireCourseInstructor = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        // Admin can access everything
        if (req.user.role === 'admin') {
            return next();
        }

        // Only lecturers can be course instructors
        if (req.user.role !== 'lecturer') {
            return res.status(403).json({
                status: 'error',
                message: 'Only lecturers can perform this action'
            });
        }

        // Check if lecturer is instructor of the course
        const courseId = req.params.courseId || req.params.id;
        if (courseId) {
            // Debug logging
            console.log('🔍 [requireCourseInstructor] Checking permissions for:', {
                userId: req.user.id,
                userRole: req.user.role,
                courseId: courseId,
                route: req.route?.path || 'unknown'
            });
            
            // Check both Subject table (for course management) and CourseSection table (for class management)
            let course = null;
            
            // Get lecturer_id for the current user (account_id -> lecturer_id mapping)
            const { Subject, Lecturer } = require('../models');
            const lecturer = await Lecturer.findOne({ where: { account_id: req.user.id } });
            
            if (!lecturer) {
                console.log('🔍 No lecturer profile found for account_id:', req.user.id);
                return res.status(403).json({
                    status: 'error',
                    message: 'Lecturer profile not found'
                });
            }
            
            console.log('🔍 Found lecturer:', { account_id: req.user.id, lecturer_id: lecturer.id });
            
            // First try to find in Subject table (for /courses/:id routes)
            course = await Subject.findOne({
                where: { 
                    id: courseId,
                    lecturer_id: lecturer.id 
                }
            });
            
            console.log('🔍 Subject table check result:', course ? 'FOUND' : 'NOT FOUND');
            
            // If not found in Subject, try CourseSection table (for /classes/:id routes)
            if (!course) {
                course = await CourseSection.findOne({
                    where: { 
                        id: courseId,
                        lecturer_id: lecturer.id 
                    }
                });
                console.log('🔍 CourseSection table check result:', course ? 'FOUND' : 'NOT FOUND');
            }

            if (!course) {
                // Additional debug: Check if course exists but with different lecturer
                const existingCourse = await Subject.findByPk(courseId) || await CourseSection.findByPk(courseId);
                console.log('🔍 Course exists but with different lecturer:', existingCourse ? {
                    id: existingCourse.id,
                    course_lecturer_id: existingCourse.lecturer_id,
                    current_lecturer_id: lecturer.id,
                    current_account_id: req.user.id
                } : 'COURSE NOT FOUND');
                
                return res.status(403).json({
                    status: 'error',
                    message: 'Bạn không có quyền chỉnh sửa lớp học phần này. Chỉ giảng viên được phân công hoặc admin mới có thể thực hiện thao tác này.'
                });
            }
            
            console.log('✅ [requireCourseInstructor] Permission granted');
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Check if user is enrolled in the course
const requireCourseEnrollment = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        // Admin and lecturers can access everything
        if (['admin', 'lecturer'].includes(req.user.role)) {
            return next();
        }

        // Check if student is enrolled in the course
        const courseId = req.params.courseId || req.params.id;
        if (courseId && req.user.role === 'student') {
            const enrollment = await StudentCourseSection.findOne({
                where: {
                    student_id: req.user.id,
                    course_section_id: courseId
                }
            });

            if (!enrollment) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You are not enrolled in this course'
                });
            }
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Check if user can access their own data or is admin/lecturer
const requireSelfOrElevated = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        // Admin and lecturers can access everything
        if (['admin', 'lecturer'].includes(req.user.role)) {
            return next();
        }

        // Students can only access their own data
        const targetUserId = req.params.userId || req.params.id;
        if (req.user.role === 'student' && req.user.id !== parseInt(targetUserId)) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only access your own data'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    requireRole,
    requireAdmin,
    requireLecturer,
    requireStudent,
    requireOwnershipOrAdmin,
    requireCourseInstructor,
    requireCourseEnrollment,
    requireSelfOrElevated
}; 
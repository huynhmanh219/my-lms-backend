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
            const course = await CourseSection.findOne({
                where: { 
                    id: courseId,
                    lecturer_id: req.user.id 
                }
            });

            if (!course) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You are not the instructor of this course'
                });
            }
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
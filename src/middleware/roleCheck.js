// Role-based Access Control Middleware
// Checks user roles and permissions

const { AppError } = require('./errorHandler');

// Check if user has required role
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        // Convert single role to array
        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        // TODO: Implement proper role checking when models are ready
        // const userRole = req.user.role_name || req.user.role;
        
        // if (!allowedRoles.includes(userRole)) {
        //     return next(new AppError('Insufficient permissions', 403));
        // }

        // Temporary role check (remove when models are implemented)
        if (!req.user.role || !allowedRoles.includes(req.user.role)) {
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

        // TODO: Implement course instructor check when models are ready
        // const courseId = req.params.courseId || req.params.id;
        // const course = await Course.findByPk(courseId);
        // 
        // if (!course || course.instructor_id !== req.user.id) {
        //     return next(new AppError('Access denied', 403));
        // }

        // Temporary implementation
        if (req.user.role !== 'lecturer') {
            return res.status(403).json({
                status: 'error',
                message: 'Only course instructors can perform this action'
            });
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

        // TODO: Implement enrollment check when models are ready
        // const courseId = req.params.courseId || req.params.id;
        // const enrollment = await Enrollment.findOne({
        //     where: {
        //         student_id: req.user.id,
        //         course_id: courseId
        //     }
        // });
        // 
        // if (!enrollment) {
        //     return next(new AppError('Not enrolled in this course', 403));
        // }

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
    requireCourseEnrollment
}; 
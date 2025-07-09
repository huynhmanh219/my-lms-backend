const { AppError } = require('./errorHandler');
const { CourseSection, StudentCourseSection, Student } = require('../models');

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];
        
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

const requireAdmin = requireRole(['admin']);

const requireLecturer = requireRole(['lecturer', 'teacher', 'admin']);

const requireStudent = requireRole(['student', 'lecturer', 'admin']);

const requireOwnershipOrAdmin = (getResourceOwnerFn) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return next(new AppError('Authentication required', 401));
            }

            if (req.user.role === 'admin') {
                return next();
            }

            let ownerId;
            if (typeof getResourceOwnerFn === 'function') {
                ownerId = await getResourceOwnerFn(req);
            } else if (typeof getResourceOwnerFn === 'string') {
                ownerId = req.params[getResourceOwnerFn];
            } else {
                ownerId = req.params.id;
            }

            if (req.user.id !== parseInt(ownerId)) {
                return next(new AppError('Access denied', 403));
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

const requireCourseInstructor = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

  
        if (req.user.role === 'admin') {
            return next();
        }

        const normalizedRole = req.user.role === 'teacher' ? 'lecturer' : req.user.role;

        if (normalizedRole !== 'lecturer') {
            return res.status(403).json({
                status: 'error',
                message: 'Only lecturers can perform this action'
            });
        }

        const courseId = req.params.courseId || req.params.id;
        if (courseId) {
            console.log('🔍 [requireCourseInstructor] Checking permissions for:', {
                userId: req.user.id,
                userRole: req.user.role,
                courseId: courseId,
                route: req.route?.path || 'unknown'
            });
            
            let course = null;
            
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
            
            course = await Subject.findOne({
                where: { 
                    id: courseId,
                    lecturer_id: lecturer.id 
                }
            });
            
            console.log('🔍 Subject table check result:', course ? 'FOUND' : 'NOT FOUND');
            
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

const requireCourseEnrollment = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        // Allow admin and lecturer to access without enrollment check
        if (['admin', 'lecturer'].includes(req.user.role)) {
            return next();
        }

        const courseId = req.params.courseId || req.params.id;
        if (courseId && req.user.role === 'student') {
            console.log('?? [requireCourseEnrollment] Checking enrollment for:', {
                accountId: req.user.id,
                courseId: courseId,
                userRole: req.user.role
            });

            // First, find the student record using account_id

            const students = await Student.findOne({ 
                where: { account_id: req.user.id } 
            });

            if (!students) {
                console.log(' No student profile found for account_id:', req.user.id);
                return res.status(403).json({
                    status: 'error',
                    message: 'Student profile not found'
                });
            }

            console.log(' Found student:', { 
                account_id: req.user.id, 
                student_id: students.id 
            });

            console.log('🔍 [requireCourseEnrollment] Checking enrollment for:', {
                accountId: req.user.id,
                courseId: courseId,
                userRole: req.user.role
            });

            // First, find the student record using account_id

            const student = await Student.findOne({ 
                where: { account_id: req.user.id } 
            });

            if (!student) {
                console.log('🔍 No student profile found for account_id:', req.user.id);
                return res.status(403).json({
                    status: 'error',
                    message: 'Student profile not found'
                });
            }

            console.log('🔍 Found student:', { 
                account_id: req.user.id, 
                student_id: students.id 
            });

            // Now check enrollment using the student's primary key
            const enrollment = await StudentCourseSection.findOne({
                where: {
                    student_id: students.id,  // Use students.id instead of req.user.id
                    course_section_id: courseId
                }
            });

            console.log('🔍 Enrollment check result:', enrollment ? 'ENROLLED' : 'NOT ENROLLED');

            if (!enrollment) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You are not enrolled in this course'
                });
            }

            console.log('✅ [requireCourseEnrollment] Enrollment verified');
        }

        next();
    } catch (error) {
        console.error('❌ [requireCourseEnrollment] Error:', error);
        next(error);
    }
};

const requireSelfOrElevated = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Authentication required', 401));
        }

        if (['admin', 'lecturer'].includes(req.user.role)) {
            return next();
        }

        
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


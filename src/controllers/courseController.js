const { Subject, CourseSection, StudentCourseSection, Account, Student, Lecturer, Role } = require('../models');
const paginationService = require('../services/paginationService');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const courseController = {
 

    // GET /courses     
    getCourses: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, search, lecturer_id, department, sort = 'created_at', order = 'desc' } = req.query;

            const whereConditions = {};

            if (search) {
                whereConditions[Op.or] = [
                    { subject_name: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    { subject_code: { [Op.like]: `%${search}%` } }
                ];
            }

            if (lecturer_id) {
                whereConditions.lecturer_id = lecturer_id;
            }

            if (department) {
                whereConditions.department = { [Op.like]: `%${department}%` };
            }

            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            const { count, rows } = await Subject.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        include: [
                            {
                                model: Account,
                                as: 'account',
                                attributes: ['email']
                            }
                        ],
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ],
                limit: queryLimit,
                offset,
                order: [[sort, order.toUpperCase()]],
                distinct: true
            });

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Courses retrieved successfully',
                data: {
                    courses: rows,
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /courses/:id - Get single course
    getCourse: async (req, res, next) => {
        try {
            const { id } = req.params;

            const course = await Subject.findByPk(id, {
                include: [
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        include: [
                            {
                                model: Account,
                                as: 'account',
                                attributes: ['email']
                            }
                        ],
                        attributes: ['id', 'first_name', 'last_name', 'title', 'department']
                    },
                    {
                        model: CourseSection,
                        as: 'courseSections',
                        attributes: ['id', 'section_name', 'max_students', 'start_date', 'end_date', 'schedule']
                    }
                ]
            });

            if (!course) {
                throw new NotFoundError('Course not found');
            }

            res.status(200).json({
                status: 'success',
                message: 'Course retrieved successfully',
                data: {
                    course
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /courses 
    createCourse: async (req, res, next) => {
        try {
            const { 
                subject_name, 
                description, 
                subject_code, 
                lecturer_id, 
                credits, 
                semester,
                academic_year 
            } = req.body;

            const lecturer = await Lecturer.findByPk(lecturer_id);
            if (!lecturer) {
                throw new ValidationError('Lecturer not found');
            }

            const existingCourse = await Subject.findOne({ where: { subject_code } });
            if (existingCourse) {
                throw new ValidationError('Course code already exists');
            }

            const course = await Subject.create({
                subject_name,
                description,
                subject_code,
                lecturer_id,
                credits,
                semester,
                academic_year
            });

            const createdCourse = await Subject.findByPk(course.id, {
                include: [
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ]
            });

            res.status(201).json({
                status: 'success',
                message: 'Course created successfully',
                data: {
                    course: createdCourse
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /courses/:id 
    updateCourse: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { 
                subject_name, 
                description, 
                subject_code, 
                lecturer_id, 
                credits, 
                semester,
                academic_year 
            } = req.body;

            const course = await Subject.findByPk(id);
            if (!course) {
                throw new NotFoundError('Course not found');
            }

            if (lecturer_id && lecturer_id !== course.lecturer_id) {
                const lecturer = await Lecturer.findByPk(lecturer_id);
                if (!lecturer) {
                    throw new ValidationError('Lecturer not found');
                }
            }

            if (subject_code && subject_code !== course.subject_code) {
                const existingCourse = await Subject.findOne({ where: { subject_code } });
                if (existingCourse) {
                    throw new ValidationError('Course code already exists');
                }
            }

            await course.update({
                subject_name: subject_name || course.subject_name,
                description: description || course.description,
                subject_code: subject_code || course.subject_code,
                lecturer_id: lecturer_id || course.lecturer_id,
                credits: credits !== undefined ? credits : course.credits,
                semester: semester || course.semester,
                academic_year: academic_year || course.academic_year
            });

            const updatedCourse = await Subject.findByPk(id, {
                include: [
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ]
            });

            res.status(200).json({
                status: 'success',
                message: 'Course updated successfully',
                data: {
                    course: updatedCourse
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /courses/:id 
    deleteCourse: async (req, res, next) => {
        try {
            const { id } = req.params;

            const course = await Subject.findByPk(id);
            if (!course) {
                throw new NotFoundError('Course not found');
            }

            const activeSections = await CourseSection.findAll({ where: { subject_id: id } });
            if (activeSections.length > 0) {
                throw new ValidationError('Cannot delete course with active sections. Please remove sections first.');
            }

            await course.destroy();

            res.status(200).json({
                status: 'success',
                message: 'Course deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

            // GET /courses/:id/students 
    getCourseStudents: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const course = await Subject.findByPk(id);
            if (!course) {
                throw new NotFoundError('Course not found');
            }

            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            const { count, rows } = await Student.findAndCountAll({
                include: [
                    {
                        model: StudentCourseSection,
                        as: 'enrollments',
                        required: true,
                        include: [
                            {
                                model: CourseSection,
                                as: 'courseSection',
                                where: { subject_id: id },
                                attributes: ['id', 'section_name']
                            }
                        ]
                    },
                    {
                        model: Account,
                        as: 'account',
                        attributes: ['email']
                    }
                ],
                limit: queryLimit,
                offset,
                distinct: true
            });

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Course students retrieved successfully',
                data: {
                    course: { id: course.id, subject_name: course.subject_name },
                    students: rows,
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /classes 
    getClasses: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, search, subject_id, lecturer_id, sort = 'created_at', order = 'desc' } = req.query;

            const whereConditions = {};

            if (search) {
                whereConditions[Op.or] = [
                    { section_name: { [Op.like]: `%${search}%` } },
                    { schedule: { [Op.like]: `%${search}%` } }
                ];
            }

            if (subject_id) {
                whereConditions.subject_id = subject_id;
            }

            if (lecturer_id) {
                whereConditions.lecturer_id = lecturer_id;
            }

            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            const { count, rows } = await CourseSection.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code', 'credits']
                    },
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ],
                limit: queryLimit,
                offset,
                order: [[sort, order.toUpperCase()]],
                distinct: true
            });

            const classesWithCount = await Promise.all(rows.map(async (cls) => {
                const enrollmentCount = await StudentCourseSection.count({
                    where: { course_section_id: cls.id }
                });
                return {
                    ...cls.toJSON(),
                    enrollmentCount
                };
            }));

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Classes retrieved successfully',
                data: {
                    classes: classesWithCount,
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /classes/:id 
    getClass: async (req, res, next) => {
        try {
            const { id } = req.params;

            const courseSection = await CourseSection.findByPk(id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code', 'credits', 'description']
                    },
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        include: [
                            {
                                model: Account,
                                as: 'account',
                                attributes: ['email']
                            }
                        ],
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ]
            });

            if (!courseSection) {
                throw new NotFoundError('Class not found');
            }

            const enrollmentCount = await StudentCourseSection.count({
                where: { course_section_id: id }
            });

            res.status(200).json({
                status: 'success',
                message: 'Class retrieved successfully',
                data: {
                    class: {
                        ...courseSection.toJSON(),
                        enrollmentCount
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /classes 
    createClass: async (req, res, next) => {
        try {
            const { 
                subject_id, 
                lecturer_id, 
                section_name, 
                max_students, 
                start_date, 
                end_date, 
                schedule,
                room 
            } = req.body;

            const subject = await Subject.findByPk(subject_id);
            if (!subject) {
                throw new ValidationError('Subject not found');
            }

            const lecturer = await Lecturer.findByPk(lecturer_id);
            if (!lecturer) {
                throw new ValidationError('Lecturer not found');
            }

            const existingSection = await CourseSection.findOne({
                where: { subject_id, section_name }
            });
            if (existingSection) {
                throw new ValidationError('Section name already exists for this subject');
            }

            const courseSection = await CourseSection.create({
                subject_id,
                lecturer_id,
                section_name,
                max_students,
                start_date,
                end_date,
                schedule,
                room
            });

            const createdClass = await CourseSection.findByPk(courseSection.id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code']
                    },
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ]
            });

            res.status(201).json({
                status: 'success',
                message: 'Class created successfully',
                data: {
                    class: createdClass
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /classes/:id 
    updateClass: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { 
                lecturer_id,        
                section_name, 
                max_students, 
                start_date, 
                end_date, 
                schedule,
                room 
            } = req.body;

            const courseSection = await CourseSection.findByPk(id);
            if (!courseSection) {
                throw new NotFoundError('Class not found');
            }

            if (lecturer_id && lecturer_id !== courseSection.lecturer_id) {
                const lecturer = await Lecturer.findByPk(lecturer_id);
                if (!lecturer) {
                    throw new ValidationError('Lecturer not found');
                }
            }

            if (max_students !== undefined) {
                const enrollmentCount = await StudentCourseSection.count({
                    where: { course_section_id: id }
                });
                if (max_students < enrollmentCount) {
                    throw new ValidationError(`Cannot reduce capacity below current enrollment count (${enrollmentCount})`);
                }
            }

            await courseSection.update({
                lecturer_id: lecturer_id || courseSection.lecturer_id,
                section_name: section_name || courseSection.section_name,
                max_students: max_students !== undefined ? max_students : courseSection.max_students,
                start_date: start_date || courseSection.start_date,
                end_date: end_date || courseSection.end_date,
                schedule: schedule || courseSection.schedule,
                room: room || courseSection.room
            });

            const updatedClass = await CourseSection.findByPk(id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code']
                    },
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ]
            });

            res.status(200).json({
                status: 'success',
                message: 'Class updated successfully',
                data: {
                    class: updatedClass
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /classes/:id 
    deleteClass: async (req, res, next) => {
        try {
            const { id } = req.params;

            const courseSection = await CourseSection.findByPk(id);
            if (!courseSection) {
                throw new NotFoundError('Class not found');
            }

            const enrollmentCount = await StudentCourseSection.count({
                where: { course_section_id: id }
            });
            if (enrollmentCount > 0) {
                throw new ValidationError('Cannot delete class with enrolled students. Please remove enrollments first.');
            }

            await courseSection.destroy();

            res.status(200).json({
                status: 'success',
                message: 'Class deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /classes/:id/students 
    getClassStudents: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const courseSection = await CourseSection.findByPk(id);
            if (!courseSection) {
                throw new NotFoundError('Class not found');
            }

            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            const { count, rows } = await Student.findAndCountAll({
                include: [
                    {
                        model: StudentCourseSection,
                        as: 'enrollments',
                        where: { course_section_id: id },
                        attributes: ['enrollment_date', 'status']
                    },
                    {
                        model: Account,
                        as: 'account',
                        attributes: ['email', 'is_active']
                    }
                ],
                limit: queryLimit,
                offset,
                distinct: true
            });

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Class students retrieved successfully',
                data: {
                    class: { id: courseSection.id, section_name: courseSection.section_name },
                    students: rows,
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /classes/:id/students 
    enrollStudents: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params;
            const { student_ids } = req.body;

            if (!Array.isArray(student_ids) || student_ids.length === 0) {
                throw new ValidationError('student_ids must be a non-empty array');
            }

            const courseSection = await CourseSection.findByPk(id);
            if (!courseSection) {
                throw new NotFoundError('Class not found');
            }

            const currentEnrollment = await StudentCourseSection.count({
                where: { course_section_id: id }
            });

            if (currentEnrollment + student_ids.length > courseSection.max_students) {
                throw new ValidationError(`Enrollment would exceed class capacity (${courseSection.max_students})`);
            }

            const results = {
                successful: [],
                failed: []
            };

            for (const student_id of student_ids) {
                try {
                    // For enrollStudents, student_id should be the actual database ID (integer)
                    const student = await Student.findByPk(student_id);
                    if (!student) {
                        results.failed.push({ student_id, error: 'Student not found' });
                        continue;
                    }

                    const existingEnrollment = await StudentCourseSection.findOne({
                        where: { student_id, course_section_id: id }
                    });
                    if (existingEnrollment) {
                        results.failed.push({ student_id, error: 'Already enrolled' });
                        continue;
                    }

                    await StudentCourseSection.create({
                        student_id,
                        course_section_id: id,
                        enrollment_date: new Date(),
                        status: 'enrolled'
                    }, { transaction });

                    results.successful.push({ student_id, status: 'enrolled' });
                } catch (error) {
                    results.failed.push({ student_id, error: error.message });
                }
            }

            await transaction.commit();

            res.status(200).json({
                status: 'success',
                message: 'Enrollment process completed',
                data: {
                    results,
                    summary: {
                        total: student_ids.length,
                        successful: results.successful.length,
                        failed: results.failed.length
                    }
                }
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    },

    // DELETE /classes/:id/students/:studentId 
    removeStudentFromClass: async (req, res, next) => {
        try {
            const { id, studentId } = req.params;

            const enrollment = await StudentCourseSection.findOne({
                where: { course_section_id: id, student_id: studentId }
            });

            if (!enrollment) {
                throw new NotFoundError('Enrollment not found');
            }

            await enrollment.destroy();

            res.status(200).json({
                status: 'success',
                message: 'Student removed from class successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /students/:id/classes 
    getStudentClasses: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10, status } = req.query;

            const student = await Student.findByPk(id);
            if (!student) {
                throw new NotFoundError('Student not found');
            }

            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            const whereConditions = { student_id: id };
            if (status) {
                whereConditions.status = status;
            }

            const { count, rows } = await StudentCourseSection.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: CourseSection,
                        as: 'courseSection',
                        include: [
                            {
                                model: Subject,
                                as: 'subject',
                                attributes: ['id', 'subject_name', 'subject_code', 'credits']
                            },
                            {
                                model: Lecturer,
                                as: 'lecturer',
                                attributes: ['id', 'first_name', 'last_name', 'title']
                            }
                        ]
                    }
                ],
                limit: queryLimit,
                offset,
                order: [['enrollment_date', 'DESC']],
                distinct: true
            });

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Student classes retrieved successfully',
                data: {
                    student: { id: student.id, first_name: student.first_name, last_name: student.last_name },
                    enrollments: rows,
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /students/me/classes - Get current student's classes
    getCurrentStudentClasses: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const accountId = req.user.id; // Get current user's account ID

            // Verify user is a student
            if (req.user.role !== 'student') {
                throw new ValidationError('Only students can access this endpoint');
            }

            // Find student record by account_id to get the actual student.id
            const student = await Student.findOne({
                where: { account_id: accountId }
            });

            if (!student) {
                throw new NotFoundError('Student profile not found');
            }

            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            const whereConditions = { student_id: student.id }; // Use student.id, not account_id
            if (status) {
                whereConditions.status = status;
            }

            const { count, rows } = await StudentCourseSection.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: CourseSection,
                        as: 'courseSection',
                        include: [
                            {
                                model: Subject,
                                as: 'subject',
                                attributes: ['id', 'subject_name', 'subject_code', 'credits', 'description']
                            },
                            {
                                model: Lecturer,
                                as: 'lecturer',
                                attributes: ['id', 'first_name', 'last_name', 'title']
                            }
                        ]
                    }
                ],
                limit: queryLimit,
                offset,
                order: [['enrollment_date', 'DESC']],
                distinct: true
            });

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Student classes retrieved successfully',
                data: {
                    enrollments: rows,
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /enrollment/bulk 
    bulkEnrollment: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { enrollments } = req.body;

            if (!Array.isArray(enrollments) || enrollments.length === 0) {
                throw new ValidationError('enrollments must be a non-empty array');
            }

            // If user is a lecturer (not admin), verify they own all the classes they're enrolling to
            if (req.user.role === 'lecturer') {
                const accountId = req.user.id;
                const lecturer = await Lecturer.findOne({ where: { account_id: accountId } });
                
                if (!lecturer) {
                    throw new ValidationError('Lecturer profile not found');
                }

                // Get unique course section IDs from enrollments
                const courseSectionIds = [...new Set(enrollments.map(e => e.course_section_id))];
                
                // Check if lecturer owns all these classes
                for (const courseSectionId of courseSectionIds) {
                    const courseSection = await CourseSection.findByPk(courseSectionId);
                    if (!courseSection || courseSection.lecturer_id !== lecturer.id) {
                        throw new ValidationError(`Access denied: You don't have permission to enroll students to class ${courseSectionId}`);
                    }
                }
            }

            const results = {
                successful: [],
                failed: []
            };

            for (const enrollment of enrollments) {
                try {
                    const { student_id, course_section_id, personal_email } = enrollment;

                    if (!student_id || !course_section_id) {
                        results.failed.push({ 
                            enrollment, 
                            error: 'student_id and course_section_id are required' 
                        });
                        continue;
                    }

                    let studentRecord = await Student.findOne({ 
                        where: { student_id: student_id.toString() } 
                    });
                    
                    if (!studentRecord) {
                        // Auto-create account & student profile
                        const Account = require('../models').Account;
                        const Role = require('../models').Role;
                        const StudentModel = require('../models').Student;

                        const loginEmail = `${student_id}@lms.com`;
                        const tempPassword = student_id.toString();
                        // check duplicate email
                        const existingAcc = await Account.findOne({ where: { email: loginEmail } });
                        if (existingAcc) {
                            results.failed.push({ enrollment, error: 'Email already exists, cannot auto-create' });
                            continue;
                        }
                        
                        const newAcc = await Account.create({
                            email: loginEmail,
                            password: tempPassword,
                            role_id: 3,
                            is_active: true,
                            first_login: true
                        }, { transaction });

                        studentRecord = await StudentModel.create({
                            account_id: newAcc.id,
                            student_id: student_id.toString(),
                            first_name: 'N/A',
                            last_name: '',
                            personal_email: personal_email || null
                        }, { transaction });

                        // send welcome email if provided
                        if (personal_email) {
                            try {
                                await require('../services/emailService').sendWelcomeEmail(personal_email, 'Bạn', loginEmail, tempPassword);
                            } catch (e) {
                                console.error('Bulk enrollment email error:', e.message);
                            }
                        }
                    }

                    // If student exists and personal_email provided but empty in DB, update and send email
                    if (studentRecord && personal_email && !studentRecord.personal_email) {
                        await studentRecord.update({ personal_email }, { transaction });
                        try {
                            const AccountModel = require('../models').Account;
                            const acc = await AccountModel.findByPk(studentRecord.account_id);
                            const loginEmail = acc ? acc.email : `${studentRecord.student_id}@lms.com`;
                            const tempPassword = studentRecord.student_id;
                            await require('../services/emailService').sendWelcomeEmail(personal_email, `${studentRecord.first_name} ${studentRecord.last_name}`.trim() || 'Bạn', loginEmail, tempPassword);
                        } catch (e) {
                            console.error('Bulk enrollment existing student email error:', e.message);
                        }
                    }

                    const courseSection = await CourseSection.findByPk(course_section_id);

                    if (!courseSection) {
                        results.failed.push({ enrollment, error: 'Course section not found' });
                        continue;
                    }

                    const currentEnrollment = await StudentCourseSection.count({
                        where: { course_section_id }
                    });

                    if (currentEnrollment >= courseSection.max_students) {
                        results.failed.push({ enrollment, error: 'Class is at capacity' });
                        continue;
                    }

                    const existingEnrollment = await StudentCourseSection.findOne({
                        where: { student_id: studentRecord.id, course_section_id }
                    });

                    if (existingEnrollment) {
                        results.failed.push({ enrollment, error: 'Already enrolled' });
                        continue;
                    }

                    await StudentCourseSection.create({
                        student_id: studentRecord.id, 
                        course_section_id,
                        enrollment_date: new Date(),
                        status: 'enrolled'
                    }, { transaction });

                    results.successful.push({ enrollment, status: 'enrolled' });
                } catch (error) {
                    results.failed.push({ enrollment, error: error.message });
                }
            }

            await transaction.commit();

            res.status(200).json({
                status: 'success',
                message: 'Bulk enrollment completed',
                data: {
                    results,
                    summary: {
                        total: enrollments.length,
                        successful: results.successful.length,
                        failed: results.failed.length
                    }
                }
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    },

        // GET /enrollment/export 
    exportEnrollment: async (req, res, next) => {
        try {
            const { course_section_id, subject_id, format = 'json' } = req.query;

            const whereConditions = {};
            const includeConditions = [
                {
                    model: Student,
                    as: 'student',
                    include: [
                        {
                            model: Account,
                            as: 'account',
                            attributes: ['email']
                        }
                    ],
                    attributes: ['id', 'student_id', 'first_name', 'last_name']
                },
                {
                    model: CourseSection,
                    as: 'courseSection',
                    include: [
                        {
                            model: Subject,
                            as: 'subject',
                            attributes: ['id', 'subject_name', 'subject_code']
                        }
                    ],
                    attributes: ['id', 'section_name']
                }
            ];

            if (course_section_id) {
                whereConditions.course_section_id = course_section_id;
            }

            if (subject_id) {
                includeConditions[1].where = { subject_id };
            }

            const enrollments = await StudentCourseSection.findAll({
                where: whereConditions,
                include: includeConditions,
                order: [['enrollment_date', 'ASC']]
            });

            const exportData = enrollments.map(enrollment => ({
                'Student ID': enrollment.student.student_id,
                'Student Name': `${enrollment.student.first_name} ${enrollment.student.last_name}`,
                'Email': enrollment.student.account.email,
                'Course Code': enrollment.courseSection.subject.subject_code,
                'Course Name': enrollment.courseSection.subject.subject_name,
                'Section': enrollment.courseSection.section_name,
                'Enrollment Date': enrollment.enrollment_date,
                'Status': enrollment.status
            }));

            res.status(200).json({
                status: 'success',
                message: 'Enrollment data exported successfully',
                data: {
                    enrollments: exportData,
                    count: exportData.length,
                    exported_at: new Date()
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /classes/:id/lectures - Get lectures in a class
    getClassLectures: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Check if class exists
            const courseSection = await CourseSection.findByPk(id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code']
                    }
                ]
            });

            if (!courseSection) {
                throw new NotFoundError('Class not found');
            }

            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            // Get all chapters for this subject
            const { Chapter, Lecture } = require('../models');
            const { count, rows } = await Lecture.findAndCountAll({
                include: [
                    {
                        model: Chapter,
                        as: 'chapter',
                        where: { subject_id: courseSection.subject_id },
                        attributes: ['id', 'title', 'order_index']
                    }
                ],
                where: { is_published: true },
                order: [
                    ['chapter', 'order_index', 'ASC'],
                    ['order_index', 'ASC']
                ],
                limit: queryLimit,
                offset,
                distinct: true
            });

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Class lectures retrieved successfully',
                data: {
                    class: {
                        id: courseSection.id,
                        section_name: courseSection.section_name,
                        subject: courseSection.subject
                    },
                    lectures: rows,
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /classes/:id/materials - Get materials in a class
    getClassMaterials: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10, material_type } = req.query;

            // Check if class exists
            const courseSection = await CourseSection.findByPk(id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code']
                    }
                ]
            });

            if (!courseSection) {
                throw new NotFoundError('Class not found');
            }

            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            // Get materials for this subject
            const { LearningMaterial } = require('../models');
            
            const whereConditions = { 
                subject_id: courseSection.subject_id,
                is_public: true 
            };

            if (material_type) {
                whereConditions.material_type = material_type;
            }

            const { count, rows } = await LearningMaterial.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Lecturer,
                        as: 'uploader',
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: queryLimit,
                offset,
                distinct: true
            });

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Class materials retrieved successfully',
                data: {
                    class: {
                        id: courseSection.id,
                        section_name: courseSection.section_name,
                        subject: courseSection.subject
                    },
                    materials: rows,
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /lecturers/me/classes - Get current lecturer's classes
    getCurrentLecturerClasses: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, search, subject_id, sort = 'created_at', order = 'desc' } = req.query;
            const accountId = req.user.id; // Get current user's account ID

            // Verify user is a lecturer
            if (req.user.role !== 'lecturer') {
                throw new ValidationError('Only lecturers can access this endpoint');
            }

            // Find lecturer record by account_id to get the actual lecturer.id
            const lecturer = await Lecturer.findOne({
                where: { account_id: accountId }
            });

            if (!lecturer) {
                throw new NotFoundError('Lecturer profile not found');
            }

            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            const whereConditions = { lecturer_id: lecturer.id }; // Use lecturer.id, not account_id
            
            if (search) {
                whereConditions[Op.or] = [
                    { section_name: { [Op.like]: `%${search}%` } }
                ];
            }

            if (subject_id) {
                whereConditions.subject_id = subject_id;
            }

            const validSortFields = ['created_at', 'section_name', 'start_date', 'end_date'];
            const sortField = validSortFields.includes(sort) ? sort : 'created_at';
            const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

            const { count, rows } = await CourseSection.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code', 'credits', 'description']
                    },
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ],
                limit: queryLimit,
                offset,
                order: [[sortField, sortOrder]],
                distinct: true
            });

            // Add enrollment count for each class
            const classesWithEnrollmentCount = await Promise.all(
                rows.map(async (courseSection) => {
                    const enrollmentCount = await StudentCourseSection.count({
                        where: { course_section_id: courseSection.id }
                    });
                    
                    return {
                        ...courseSection.toJSON(),
                        enrollmentCount
                    };
                })
            );

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Lecturer classes retrieved successfully',
                data: {
                    classes: classesWithEnrollmentCount,
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = courseController; 

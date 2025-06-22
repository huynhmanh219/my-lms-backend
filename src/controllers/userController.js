// User Controller
// Handles user management operations for teachers and students

const { Account, Role, Student, Lecturer } = require('../models');
const authService = require('../services/authService');
const paginationService = require('../services/paginationService');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const userController = {
    // ==========================================
    // TEACHER MANAGEMENT (7 APIs)
    // ==========================================

    // GET /users/teachers - Get teachers with pagination, search, filters
    getTeachers: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, search, department, title, sort = 'created_at', order = 'desc' } = req.query;

            // Build search conditions
            const whereConditions = {};
            const accountWhereConditions = { role_id: 2 }; // Lecturer role
            const lecturerWhereConditions = {};

            if (search) {
                accountWhereConditions[Op.or] = [
                    { email: { [Op.like]: `%${search}%` } }
                ];
                lecturerWhereConditions[Op.or] = [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } }
                ];
            }

            if (department) {
                lecturerWhereConditions.department = { [Op.like]: `%${department}%` };
            }

            if (title) {
                lecturerWhereConditions.title = { [Op.like]: `%${title}%` };
            }

            // Get paginated results
            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            const { count, rows } = await Account.findAndCountAll({
                where: accountWhereConditions,
                include: [
                    {
                        model: Role,
                        as: 'role',
                        attributes: ['id', 'name']
                    },
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        where: lecturerWhereConditions,
                        required: true,
                        attributes: ['id', 'first_name', 'last_name', 'phone', 'title', 'department', 'bio', 'avatar']
                    }
                ],
                limit: queryLimit,
                offset,
                order: [[{ model: Lecturer, as: 'lecturer' }, sort, order.toUpperCase()]],
                distinct: true
            });

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Teachers retrieved successfully',
                data: {
                    teachers: rows.map(account => ({
                        id: account.id,
                        email: account.email,
                        is_active: account.is_active,
                        created_at: account.created_at,
                        profile: account.lecturer
                    })),
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/teachers/:id - Get single teacher
    getTeacher: async (req, res, next) => {
        try {
            const { id } = req.params;

            const teacher = await Account.findOne({
                where: { id, role_id: 2 },
                include: [
                    {
                        model: Role,
                        as: 'role',
                        attributes: ['id', 'name']
                    },
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        attributes: ['id', 'first_name', 'last_name', 'phone', 'title', 'department', 'bio', 'avatar']
                    }
                ]
            });

            if (!teacher) {
                throw new NotFoundError('Teacher not found');
            }

            res.status(200).json({
                status: 'success',
                message: 'Teacher retrieved successfully',
                data: {
                    teacher: {
                        id: teacher.id,
                        email: teacher.email,
                        is_active: teacher.is_active,
                        created_at: teacher.created_at,
                        last_login: teacher.last_login,
                        profile: teacher.lecturer
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /users/teachers - Create teacher (account + lecturer profile)
    createTeacher: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { email, password, first_name, last_name, phone, title, department, bio } = req.body;

            // Check if email already exists
            const existingAccount = await Account.findOne({ where: { email } });
            if (existingAccount) {
                throw new ValidationError('Email already exists');
            }

            // Create account
            const account = await Account.create({
                email,
                password, // Will be hashed by model hook
                role_id: 2, // Lecturer role
                is_active: true
            }, { transaction });

            // Create lecturer profile
            const lecturer = await Lecturer.create({
                account_id: account.id,
                first_name,
                last_name,
                phone,
                title,
                department,
                bio
            }, { transaction });

            await transaction.commit();

            res.status(201).json({
                status: 'success',
                message: 'Teacher created successfully',
                data: {
                    teacher: {
                        id: account.id,
                        email: account.email,
                        is_active: account.is_active,
                        profile: lecturer
                    }
                }
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    },

    // PUT /users/teachers/:id - Update teacher
    updateTeacher: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params;
            const { email, first_name, last_name, phone, title, department, bio, is_active } = req.body;

            // Find teacher
            const account = await Account.findOne({
                where: { id, role_id: 2 },
                include: [{ model: Lecturer, as: 'lecturer' }]
            });

            if (!account) {
                throw new NotFoundError('Teacher not found');
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== account.email) {
                const existingAccount = await Account.findOne({ where: { email } });
                if (existingAccount) {
                    throw new ValidationError('Email already exists');
                }
            }

            // Update account
            await account.update({
                email: email || account.email,
                is_active: is_active !== undefined ? is_active : account.is_active
            }, { transaction });

            // Update lecturer profile
            await account.lecturer.update({
                first_name: first_name || account.lecturer.first_name,
                last_name: last_name || account.lecturer.last_name,
                phone: phone || account.lecturer.phone,
                title: title || account.lecturer.title,
                department: department || account.lecturer.department,
                bio: bio || account.lecturer.bio
            }, { transaction });

            await transaction.commit();

            // Fetch updated teacher
            const updatedTeacher = await Account.findByPk(id, {
                include: [{ model: Lecturer, as: 'lecturer' }]
            });

            res.status(200).json({
                status: 'success',
                message: 'Teacher updated successfully',
                data: {
                    teacher: {
                        id: updatedTeacher.id,
                        email: updatedTeacher.email,
                        is_active: updatedTeacher.is_active,
                        profile: updatedTeacher.lecturer
                    }
                }
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    },

    // DELETE /users/teachers/:id - Soft delete teacher
    deleteTeacher: async (req, res, next) => {
        try {
            const { id } = req.params;

            const teacher = await Account.findOne({
                where: { id, role_id: 2 }
            });

            if (!teacher) {
                throw new NotFoundError('Teacher not found');
            }

            // Soft delete by setting is_active to false
            await teacher.update({ is_active: false });

            res.status(200).json({
                status: 'success',
                message: 'Teacher deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/teachers/export-excel - Export teachers to Excel
    exportTeachersExcel: async (req, res, next) => {
        try {
            // TODO: Implement Excel export functionality
            // For now, return JSON that could be used for Excel export
            const teachers = await Account.findAll({
                where: { role_id: 2, is_active: true },
                include: [
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        attributes: ['first_name', 'last_name', 'phone', 'title', 'department']
                    }
                ],
                attributes: ['id', 'email', 'created_at']
            });

            const exportData = teachers.map(teacher => ({
                'Teacher ID': teacher.id,
                'Email': teacher.email,
                'First Name': teacher.lecturer?.first_name || '',
                'Last Name': teacher.lecturer?.last_name || '',
                'Phone': teacher.lecturer?.phone || '',
                'Title': teacher.lecturer?.title || '',
                'Department': teacher.lecturer?.department || '',
                'Created Date': teacher.created_at
            }));

            res.status(200).json({
                status: 'success',
                message: 'Teachers export data generated',
                data: {
                    teachers: exportData,
                    count: exportData.length
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /users/teachers/:id/upload-avatar - Upload teacher avatar
    uploadTeacherAvatar: async (req, res, next) => {
        try {
            const { id } = req.params;

            const teacher = await Account.findOne({
                where: { id, role_id: 2 },
                include: [{ model: Lecturer, as: 'lecturer' }]
            });

            if (!teacher) {
                throw new NotFoundError('Teacher not found');
            }

            // TODO: Implement file upload logic with multer
            // For now, simulate avatar upload
            const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

            if (avatarUrl) {
                await teacher.lecturer.update({ avatar: avatarUrl });
            }

            res.status(200).json({
                status: 'success',
                message: 'Avatar uploaded successfully',
                data: {
                    avatar_url: avatarUrl
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // ==========================================
    // STUDENT MANAGEMENT (8 APIs)
    // ==========================================

    // GET /users/students - Get students with pagination, search, filters
    getStudents: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, search, class_id, sort = 'created_at', order = 'desc' } = req.query;

            // Build search conditions
            const accountWhereConditions = { role_id: 3 }; // Student role
            const studentWhereConditions = {};

            if (search) {
                accountWhereConditions[Op.or] = [
                    { email: { [Op.like]: `%${search}%` } }
                ];
                studentWhereConditions[Op.or] = [
                    { first_name: { [Op.like]: `%${search}%` } },
                    { last_name: { [Op.like]: `%${search}%` } },
                    { student_id: { [Op.like]: `%${search}%` } }
                ];
            }

            // Get paginated results
            const { offset, limit: queryLimit } = paginationService.getOffsetLimit(page, limit);

            const { count, rows } = await Account.findAndCountAll({
                where: accountWhereConditions,
                include: [
                    {
                        model: Role,
                        as: 'role',
                        attributes: ['id', 'name']
                    },
                    {
                        model: Student,
                        as: 'student',
                        where: studentWhereConditions,
                        required: true,
                        attributes: ['id', 'student_id', 'first_name', 'last_name', 'phone', 'date_of_birth', 'address', 'avatar']
                    }
                ],
                limit: queryLimit,
                offset,
                order: [[{ model: Student, as: 'student' }, sort, order.toUpperCase()]],
                distinct: true
            });

            const pagination = paginationService.getPaginationData(count, page, limit);

            res.status(200).json({
                status: 'success',
                message: 'Students retrieved successfully',
                data: {
                    students: rows.map(account => ({
                        id: account.id,
                        email: account.email,
                        is_active: account.is_active,
                        created_at: account.created_at,
                        profile: account.student
                    })),
                    pagination
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/students/:id - Get single student
    getStudent: async (req, res, next) => {
        try {
            const { id } = req.params;

            const student = await Account.findOne({
                where: { id, role_id: 3 },
                include: [
                    {
                        model: Role,
                        as: 'role',
                        attributes: ['id', 'name']
                    },
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'student_id', 'first_name', 'last_name', 'phone', 'date_of_birth', 'address', 'avatar']
                    }
                ]
            });

            if (!student) {
                throw new NotFoundError('Student not found');
            }

            res.status(200).json({
                status: 'success',
                message: 'Student retrieved successfully',
                data: {
                    student: {
                        id: student.id,
                        email: student.email,
                        is_active: student.is_active,
                        created_at: student.created_at,
                        last_login: student.last_login,
                        profile: student.student
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /users/students - Create student (account + student profile)
    createStudent: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { email, password, student_id, first_name, last_name, phone, date_of_birth, address } = req.body;

            // Check if email already exists
            const existingAccount = await Account.findOne({ where: { email } });
            if (existingAccount) {
                throw new ValidationError('Email already exists');
            }

            // Check if student ID already exists
            const existingStudent = await Student.findOne({ where: { student_id } });
            if (existingStudent) {
                throw new ValidationError('Student ID already exists');
            }

            // Create account
            const account = await Account.create({
                email,
                password, // Will be hashed by model hook
                role_id: 3, // Student role
                is_active: true
            }, { transaction });

            // Create student profile
            const student = await Student.create({
                account_id: account.id,
                student_id,
                first_name,
                last_name,
                phone,
                date_of_birth,
                address
            }, { transaction });

            await transaction.commit();

            res.status(201).json({
                status: 'success',
                message: 'Student created successfully',
                data: {
                    student: {
                        id: account.id,
                        email: account.email,
                        is_active: account.is_active,
                        profile: student
                    }
                }
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    },

    // PUT /users/students/:id - Update student
    updateStudent: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params;
            const { email, student_id, first_name, last_name, phone, date_of_birth, address, is_active } = req.body;

            // Find student
            const account = await Account.findOne({
                where: { id, role_id: 3 },
                include: [{ model: Student, as: 'student' }]
            });

            if (!account) {
                throw new NotFoundError('Student not found');
            }

            // Check if email is being changed and if it's already taken
            if (email && email !== account.email) {
                const existingAccount = await Account.findOne({ where: { email } });
                if (existingAccount) {
                    throw new ValidationError('Email already exists');
                }
            }

            // Check if student ID is being changed and if it's already taken
            if (student_id && student_id !== account.student.student_id) {
                const existingStudent = await Student.findOne({ where: { student_id } });
                if (existingStudent) {
                    throw new ValidationError('Student ID already exists');
                }
            }

            // Update account
            await account.update({
                email: email || account.email,
                is_active: is_active !== undefined ? is_active : account.is_active
            }, { transaction });

            // Update student profile
            await account.student.update({
                student_id: student_id || account.student.student_id,
                first_name: first_name || account.student.first_name,
                last_name: last_name || account.student.last_name,
                phone: phone || account.student.phone,
                date_of_birth: date_of_birth || account.student.date_of_birth,
                address: address || account.student.address
            }, { transaction });

            await transaction.commit();

            // Fetch updated student
            const updatedStudent = await Account.findByPk(id, {
                include: [{ model: Student, as: 'student' }]
            });

            res.status(200).json({
                status: 'success',
                message: 'Student updated successfully',
                data: {
                    student: {
                        id: updatedStudent.id,
                        email: updatedStudent.email,
                        is_active: updatedStudent.is_active,
                        profile: updatedStudent.student
                    }
                }
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    },

    // DELETE /users/students/:id - Soft delete student
    deleteStudent: async (req, res, next) => {
        try {
            const { id } = req.params;

            const student = await Account.findOne({
                where: { id, role_id: 3 }
            });

            if (!student) {
                throw new NotFoundError('Student not found');
            }

            // Soft delete by setting is_active to false
            await student.update({ is_active: false });

            res.status(200).json({
                status: 'success',
                message: 'Student deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /users/students/import-excel - Import students from Excel
    importStudentsExcel: async (req, res, next) => {
        try {
            // TODO: Implement Excel import functionality
            // For now, simulate import process
            const importResults = {
                total: 0,
                successful: 0,
                failed: 0,
                errors: []
            };

            res.status(200).json({
                status: 'success',
                message: 'Student import completed',
                data: importResults
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/students/export-excel - Export students to Excel
    exportStudentsExcel: async (req, res, next) => {
        try {
            // TODO: Implement Excel export functionality
            // For now, return JSON that could be used for Excel export
            const students = await Account.findAll({
                where: { role_id: 3, is_active: true },
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['student_id', 'first_name', 'last_name', 'phone', 'date_of_birth', 'address']
                    }
                ],
                attributes: ['id', 'email', 'created_at']
            });

            const exportData = students.map(student => ({
                'Account ID': student.id,
                'Student ID': student.student?.student_id || '',
                'Email': student.email,
                'First Name': student.student?.first_name || '',
                'Last Name': student.student?.last_name || '',
                'Phone': student.student?.phone || '',
                'Date of Birth': student.student?.date_of_birth || '',
                'Address': student.student?.address || '',
                'Created Date': student.created_at
            }));

            res.status(200).json({
                status: 'success',
                message: 'Students export data generated',
                data: {
                    students: exportData,
                    count: exportData.length
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /users/students/:id/upload-avatar - Upload student avatar
    uploadStudentAvatar: async (req, res, next) => {
        try {
            const { id } = req.params;

            const student = await Account.findOne({
                where: { id, role_id: 3 },
                include: [{ model: Student, as: 'student' }]
            });

            if (!student) {
                throw new NotFoundError('Student not found');
            }

            // TODO: Implement file upload logic with multer
            // For now, simulate avatar upload
            const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

            if (avatarUrl) {
                await student.student.update({ avatar: avatarUrl });
            }

            res.status(200).json({
                status: 'success',
                message: 'Avatar uploaded successfully',
                data: {
                    avatar_url: avatarUrl
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // ==========================================
    // ROLE MANAGEMENT (1 API)
    // ==========================================

    // GET /users/roles - Get all roles
    getRoles: async (req, res, next) => {
        try {
            const roles = await Role.findAll({
                attributes: ['id', 'name', 'description'],
                order: [['id', 'ASC']]
            });

            res.status(200).json({
                status: 'success',
                message: 'Roles retrieved successfully',
                data: {
                    roles
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = userController; 
const { Account, Role, Student, Lecturer } = require('../models');
const authService = require('../services/authService');
const paginationService = require('../services/paginationService');
const { ValidationError, NotFoundError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const userController = {
    // GET /users/teachers 
    getTeachers: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, search, department, title, sort = 'created_at', order = 'desc' } = req.query;

            const whereConditions = {};
            const accountWhereConditions = { role_id: 2 };
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

    // GET /users/teachers/:id 
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

    // POST /users/teachers 
    createTeacher: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { email, password, first_name, last_name, phone, title, department, bio } = req.body;

            const existingAccount = await Account.findOne({ where: { email } });
            if (existingAccount) {
                throw new ValidationError('Email already exists');
            }

            const account = await Account.create({
                email,
                password,
                role_id: 2,
                is_active: true
            }, { transaction });

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

    // PUT /users/teachers/:id 
    updateTeacher: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params;
            const { email, first_name, last_name, phone, title, department, bio, is_active } = req.body;

            const account = await Account.findOne({
                where: { id, role_id: 2 },
                include: [{ model: Lecturer, as: 'lecturer' }]
            });

            if (!account) {
                throw new NotFoundError('Teacher not found');
            }

            if (email && email !== account.email) {
                const existingAccount = await Account.findOne({ where: { email } });
                if (existingAccount) {
                    throw new ValidationError('Email already exists');
                }
            }

            await account.update({
                email: email || account.email,
                is_active: is_active !== undefined ? is_active : account.is_active
            }, { transaction });

            await account.lecturer.update({
                first_name: first_name || account.lecturer.first_name,
                last_name: last_name || account.lecturer.last_name,
                phone: phone || account.lecturer.phone,
                title: title || account.lecturer.title,
                department: department || account.lecturer.department,
                bio: bio || account.lecturer.bio
            }, { transaction });

            await transaction.commit();

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

    // DELETE /users/teachers/:id 
    deleteTeacher: async (req, res, next) => {
        try {
            const { id } = req.params;

            const teacher = await Account.findOne({
                where: { id, role_id: 2 }
            });

            if (!teacher) {
                throw new NotFoundError('Teacher not found');
            }

            await teacher.update({ is_active: false });

            res.status(200).json({
                status: 'success',
                message: 'Teacher deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /users/teachers/export-excel 
    exportTeachersExcel: async (req, res, next) => {
        try {
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

    // POST /users/teachers/:id/upload-avatar 
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

    // GET /users/students 
    getStudents: async (req, res, next) => {
        try {
            const { page = 1, limit = 10, search, class_id, sort = 'created_at', order = 'desc' } = req.query;

            const accountWhereConditions = { role_id: 3 };
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

    // GET /users/students/:id 
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

    // POST /users/students 
    createStudent: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { student_id, first_name, last_name, phone, date_of_birth, address } = req.body;

            const email = `${student_id}@lms.com`;
            const password = student_id;

            const existingAccount = await Account.findOne({ where: { email } });
            if (existingAccount) {
                throw new ValidationError('Email already exists (Student ID already used)');
            }

            const existingStudent = await Student.findOne({ where: { student_id } });
            if (existingStudent) {
                throw new ValidationError('Student ID already exists');
            }

            const account = await Account.create({
                email,
                password,
                role_id: 3,
                is_active: true,
                first_login: true
            }, { transaction });

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
                        auto_generated_password: password,
                        profile: student
                    }
                }
            });
        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    },

    // PUT /users/students/:id 
    updateStudent: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const { id } = req.params;
            const { email, student_id, first_name, last_name, phone, date_of_birth, address, is_active } = req.body;

            const account = await Account.findOne({
                where: { id, role_id: 3 },
                include: [{ model: Student, as: 'student' }]
            });

            if (!account) {
                throw new NotFoundError('Student not found');
            }

            if (email && email !== account.email) {
                const existingAccount = await Account.findOne({ where: { email } });
                if (existingAccount) {
                    throw new ValidationError('Email already exists');
                }
            }

            if (student_id && student_id !== account.student.student_id) {
                const existingStudent = await Student.findOne({ where: { student_id } });
                if (existingStudent) {
                    throw new ValidationError('Student ID already exists');
                }
            }

            await account.update({
                email: email || account.email,
                is_active: is_active !== undefined ? is_active : account.is_active
            }, { transaction });

            await account.student.update({
                student_id: student_id || account.student.student_id,
                first_name: first_name || account.student.first_name,
                last_name: last_name || account.student.last_name,
                phone: phone || account.student.phone,
                date_of_birth: date_of_birth || account.student.date_of_birth,
                address: address || account.student.address
            }, { transaction });

            await transaction.commit();

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

    // DELETE /users/students/:id 
    deleteStudent: async (req, res, next) => {
        try {
            const { id } = req.params;

            const student = await Account.findOne({
                where: { id, role_id: 3 }
            });

            if (!student) {
                throw new NotFoundError('Student not found');
            }

            await student.update({ is_active: false });

            res.status(200).json({
                status: 'success',
                message: 'Student deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /users/students/import-excel 
    importStudentsExcel: async (req, res, next) => {
        try {
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

    // GET /users/roles 
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
    },

    // GET /users/profile - Get current user's profile
    getCurrentUserProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            let account;
            if (userRole === 'student') {
                account = await Account.findByPk(userId, {
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
            } else if (userRole === 'lecturer') {
                account = await Account.findByPk(userId, {
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
            } else {
                account = await Account.findByPk(userId, {
                    include: [
                        {
                            model: Role,
                            as: 'role',
                            attributes: ['id', 'name']
                        }
                    ]
                });
            }

            if (!account) {
                throw new NotFoundError('User not found');
            }

            const profileData = {
                id: account.id,
                email: account.email,
                role: account.role.name,
                is_active: account.is_active,
                first_login: account.first_login,
                last_login: account.last_login,
                created_at: account.created_at
            };

            if (userRole === 'student' && account.student) {
                profileData.profile = account.student;
            } else if (userRole === 'lecturer' && account.lecturer) {
                profileData.profile = account.lecturer;
            }

            res.status(200).json({
                status: 'success',
                message: 'Profile retrieved successfully',
                data: {
                    user: profileData
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /users/profile - Update current user's profile
    updateCurrentUserProfile: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        
        try {
            const userId = req.user.id;
            const userRole = req.user.role;
            const { first_name, last_name, phone, date_of_birth, address, title, department, bio } = req.body;

            const account = await Account.findByPk(userId);
            if (!account) {
                throw new NotFoundError('User not found');
            }

            if (userRole === 'student') {
                const student = await Student.findOne({ where: { account_id: userId } });
                if (!student) {
                    throw new NotFoundError('Student profile not found');
                }

                await student.update({
                    first_name: first_name || student.first_name,
                    last_name: last_name || student.last_name,
                    phone: phone || student.phone,
                    date_of_birth: date_of_birth || student.date_of_birth,
                    address: address || student.address
                }, { transaction });

            } else if (userRole === 'lecturer') {
                const lecturer = await Lecturer.findOne({ where: { account_id: userId } });
                if (!lecturer) {
                    throw new NotFoundError('Lecturer profile not found');
                }

                await lecturer.update({
                    first_name: first_name || lecturer.first_name,
                    last_name: last_name || lecturer.last_name,
                    phone: phone || lecturer.phone,
                    title: title || lecturer.title,
                    department: department || lecturer.department,
                    bio: bio || lecturer.bio
                }, { transaction });
            }

            await transaction.commit();

            // Return updated profile
            const updatedProfile = await userController.getCurrentUserProfile(req, res, next);

        } catch (error) {
            await transaction.rollback();
            next(error);
        }
    },

    // POST /users/profile/avatar - Upload avatar for current user
    uploadCurrentUserAvatar: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const userRole = req.user.role;

            if (!req.file) {
                throw new ValidationError('No file uploaded');
            }

            const avatarUrl = `/uploads/avatars/${req.file.filename}`;

            if (userRole === 'student') {
                const student = await Student.findOne({ where: { account_id: userId } });
                if (!student) {
                    throw new NotFoundError('Student profile not found');
                }
                await student.update({ avatar: avatarUrl });

            } else if (userRole === 'lecturer') {
                const lecturer = await Lecturer.findOne({ where: { account_id: userId } });
                if (!lecturer) {
                    throw new NotFoundError('Lecturer profile not found');
                }
                await lecturer.update({ avatar: avatarUrl });
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

    // GET /users/students/export-excel 
    exportStudentsExcel: async (req, res, next) => {
        try {
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

    // POST /users/students/:id/upload-avatar 
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
    }
};

module.exports = userController; 
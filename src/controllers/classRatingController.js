const { ClassRating, Student, CourseSection, Subject, Lecturer, Account } = require('../models');
const { Op } = require('sequelize');

const classRatingController = {
    // GET /api/class-ratings/class/:classId - Lấy tất cả ratings của 1 lớp học
    getClassRatings: async (req, res, next) => {
        try {
            const { classId } = req.params;
            const { page = 1, size = 10 } = req.query;
            const limit = parseInt(size);
            const offset = (parseInt(page) - 1) * limit;

            // Kiểm tra lớp học có tồn tại không
            const courseSection = await CourseSection.findByPk(classId);
            if (!courseSection) {
                return res.status(404).json({
                    success: false,
                    message: 'Class not found'
                });
            }

            // Lấy ratings với thông tin sinh viên
            const { count, rows: ratings } = await ClassRating.findAndCountAll({
                where: { class_id: classId },
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'first_name', 'last_name'],
                        include: [
                            {
                                model: Account,
                                as: 'account',
                                attributes: ['email']
                            }
                        ]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit,
                offset
            });

            // Lấy thống kê
            const stats = await ClassRating.getAverageRating(classId);
            const distribution = await ClassRating.getRatingDistribution(classId);

            res.status(200).json({
                success: true,
                message: 'Class ratings retrieved successfully',
                data: {
                    ratings,
                    statistics: {
                        ...stats,
                        distribution
                    },
                    pagination: {
                        page: parseInt(page),
                        size: limit,
                        total: count,
                        totalPages: Math.ceil(count / limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/class-ratings/class/:classId/stats - Lấy thống kê rating của lớp học
    getClassRatingStats: async (req, res, next) => {
        try {
            const { classId } = req.params;

            const courseSection = await CourseSection.findByPk(classId);
            if (!courseSection) {
                return res.status(404).json({
                    success: false,
                    message: 'Class not found'
                });
            }

            const stats = await ClassRating.getAverageRating(classId);
            const distribution = await ClassRating.getRatingDistribution(classId);

            res.status(200).json({
                success: true,
                message: 'Class rating statistics retrieved successfully',
                data: {
                    ...stats,
                    ratingBreakdown: distribution
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/class-ratings/class/:classId/my-rating - Lấy rating của sinh viên hiện tại cho lớp học
    getMyClassRating: async (req, res, next) => {
        try {
            const { classId } = req.params;
            const userId = req.user.id;

            const student = await Student.findOne({ where: { account_id: userId } });
            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: 'Only students can access this endpoint'
                });
            }

            const rating = await ClassRating.findOne({
                where: {
                    class_id: classId,
                    student_id: student.id
                }
            });

            if (!rating) {
                return res.status(404).json({
                    success: false,
                    message: 'No rating found',
                    data: null
                });
            }

            res.status(200).json({
                success: true,
                message: 'My class rating retrieved successfully',
                data: rating
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/class-ratings - Tạo đánh giá mới cho lớp học
    createClassRating: async (req, res, next) => {
        try {
            const { class_id, rating, comment } = req.body;
            const userId = req.user.id;

            // Kiểm tra lớp học có tồn tại không
            const courseSection = await CourseSection.findByPk(class_id);
            if (!courseSection) {
                return res.status(404).json({
                    success: false,
                    message: 'Class not found'
                });
            }

            // Kiểm tra user là sinh viên
            const student = await Student.findOne({ where: { account_id: userId } });
            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: 'Only students can rate classes'
                });
            }

            // Kiểm tra đã đánh giá chưa
            const existingRating = await ClassRating.findOne({
                where: {
                    class_id: class_id,
                    student_id: student.id
                }
            });

            if (existingRating) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already rated this class. Use PUT to update your rating.'
                });
            }

            // Tạo rating mới
            const newRating = await ClassRating.create({
                class_id: class_id,
                student_id: student.id,
                rating: parseInt(rating),
                comment: comment || null
            });

            // Lấy rating vừa tạo với thông tin sinh viên
            const createdRating = await ClassRating.findByPk(newRating.id, {
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'first_name', 'last_name'],
                        include: [
                            {
                                model: Account,
                                as: 'account',
                                attributes: ['email']
                            }
                        ]
                    }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Class rating created successfully',
                data: createdRating
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /api/class-ratings/:id - Cập nhật đánh giá lớp học
    updateClassRating: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.id;

            // Tìm rating
            const classRating = await ClassRating.findByPk(id, {
                include: [
                    {
                        model: Student,
                        as: 'student',
                        include: [
                            {
                                model: Account,
                                as: 'account',
                                attributes: ['id']
                            }
                        ]
                    }
                ]
            });

            if (!classRating) {
                return res.status(404).json({
                    success: false,
                    message: 'Rating not found'
                });
            }

            // Kiểm tra quyền sở hữu
            if (classRating.student.account.id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update your own ratings'
                });
            }

            // Cập nhật
            await classRating.update({
                rating: rating ? parseInt(rating) : classRating.rating,
                comment: comment !== undefined ? comment : classRating.comment
            });

            // Lấy rating đã cập nhật
            const updatedRating = await ClassRating.findByPk(id, {
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'first_name', 'last_name'],
                        include: [
                            {
                                model: Account,
                                as: 'account',
                                attributes: ['email']
                            }
                        ]
                    }
                ]
            });

            res.status(200).json({
                success: true,
                message: 'Class rating updated successfully',
                data: updatedRating
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/class-ratings/:id - Xóa đánh giá lớp học
    deleteClassRating: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const classRating = await ClassRating.findByPk(id, {
                include: [
                    {
                        model: Student,
                        as: 'student',
                        include: [
                            {
                                model: Account,
                                as: 'account',
                                attributes: ['id']
                            }
                        ]
                    }
                ]
            });

            if (!classRating) {
                return res.status(404).json({
                    success: false,
                    message: 'Rating not found'
                });
            }

            // Cho phép admin xóa bất kỳ đánh giá nào; sinh viên chỉ xóa đánh giá của chính họ
            if (req.user.role !== 'admin' && classRating.student.account.id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only delete your own ratings'
                });
            }

            await classRating.destroy();

            res.status(200).json({
                success: true,
                message: 'Class rating deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/class-ratings/top-rated - Lấy danh sách lớp học được đánh giá cao nhất
    getTopRatedClasses: async (req, res, next) => {
        try {
            const { limit = 10 } = req.query;

            const topClasses = await ClassRating.getTopRatedClasses(parseInt(limit));
            
            // Lấy thông tin chi tiết của các lớp học
            const classIds = topClasses.map(c => c.class_id);
            const classes = await CourseSection.findAll({
                where: { id: { [Op.in]: classIds } },
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code'],
                        include: [
                            {
                                model: Lecturer,
                                as: 'lecturer',
                                attributes: ['id', 'first_name', 'last_name', 'title']
                            }
                        ]
                    }
                ]
            });

            // Kết hợp thông tin
            const result = topClasses.map(topClass => {
                const classInfo = classes.find(c => c.id === topClass.class_id);
                return {
                    ...topClass,
                    class_info: classInfo
                };
            });

            res.status(200).json({
                success: true,
                message: 'Top rated classes retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/class-ratings/my-ratings - Lấy tất cả đánh giá của sinh viên hiện tại
    getMyClassRatings: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { page = 1, size = 10 } = req.query;
            const limit = parseInt(size);
            const offset = (parseInt(page) - 1) * limit;

            const student = await Student.findOne({ where: { account_id: userId } });
            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: 'Only students can access this endpoint'
                });
            }

            const { count, rows: ratings } = await ClassRating.findAndCountAll({
                where: { student_id: student.id },
                include: [
                    {
                        model: CourseSection,
                        as: 'courseSection',
                        attributes: ['id', 'section_name'],
                        include: [
                            {
                                model: Subject,
                                as: 'subject',
                                attributes: ['id', 'subject_name', 'subject_code']
                            }
                        ]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit,
                offset
            });

            res.status(200).json({
                success: true,
                message: 'My class ratings retrieved successfully',
                data: {
                    ratings,
                    pagination: {
                        page: parseInt(page),
                        size: limit,
                        total: count,
                        totalPages: Math.ceil(count / limit)
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = classRatingController; 
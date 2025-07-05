const { LectureRating, Student, Lecture, Account, Lecturer } = require('../models');

const lectureRatingController = {
    // GET /api/lectures/:lectureId/ratings - Lấy tất cả ratings của 1 bài giảng
    getLectureRatings: async (req, res, next) => {
        try {
            const { lectureId } = req.params;
            const { page = 1, size = 10 } = req.query;
            const limit = parseInt(size);
            const offset = (parseInt(page) - 1) * limit;

            const lecture = await Lecture.findByPk(lectureId);
            if (!lecture) {
                return res.status(404).json({
                    success: false,
                    message: 'Lecture not found'
                });
            }

            const { count, rows: ratings } = await LectureRating.findAndCountAll({
                where: { lecture_id: lectureId },
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

            const stats = await LectureRating.getAverageRating(lectureId);
            const distribution = await LectureRating.getRatingDistribution(lectureId);

            res.status(200).json({
                success: true,
                message: 'Lecture ratings retrieved successfully',
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

    createLectureRating: async (req, res, next) => {
        try {
            const { lectureId } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.id;

            const lecture = await Lecture.findByPk(lectureId);
            if (!lecture) {
                return res.status(404).json({
                    success: false,
                    message: 'Lecture not found'
                });
            }

            const student = await Student.findOne({ where: { account_id: userId } });
            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: 'Only students can rate lectures'
                });
            }

            const existingRating = await LectureRating.findOne({
                where: {
                    lecture_id: lectureId,
                    student_id: student.id
                }
            });

            if (existingRating) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already rated this lecture. Use PUT to update your rating.'
                });
            }

            const newRating = await LectureRating.create({
                lecture_id: lectureId,
                student_id: student.id,
                rating: parseInt(rating),
                comment: comment || null
            });

            const createdRating = await LectureRating.findByPk(newRating.id, {
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
                message: 'Rating created successfully',
                data: createdRating
            });
        } catch (error) {
            next(error);
        }
    },

    updateLectureRating: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { rating, comment } = req.body;
            const userId = req.user.id;

            const lectureRating = await LectureRating.findByPk(id, {
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

            if (!lectureRating) {
                return res.status(404).json({
                    success: false,
                    message: 'Rating not found'
                });
            }

            if (lectureRating.student.account.id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update your own ratings'
                });
            }

            await lectureRating.update({
                rating: rating ? parseInt(rating) : lectureRating.rating,
                comment: comment !== undefined ? comment : lectureRating.comment
            });

            const updatedRating = await LectureRating.findByPk(id, {
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
                message: 'Rating updated successfully',
                data: updatedRating
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/lecture-ratings/:id - Xóa rating
    deleteLectureRating: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const lectureRating = await LectureRating.findByPk(id, {
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

            if (!lectureRating) {
                return res.status(404).json({
                    success: false,
                    message: 'Rating not found'
                });
            }

            if (lectureRating.student.account.id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only delete your own ratings'
                });
            }

            await lectureRating.destroy();

            res.status(200).json({
                success: true,
                message: 'Rating deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /api/my-lectures/ratings - Xem ratings cho lectures của giảng viên
    getMyLectureRatings: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { page = 1, size = 10 } = req.query;
            const limit = parseInt(size);
            const offset = (parseInt(page) - 1) * limit;

            const lecturer = await Lecturer.findOne({ where: { account_id: userId } });
            if (!lecturer) {
                return res.status(403).json({
                    success: false,
                    message: 'Only lecturers can access this endpoint'
                });
            }

            const { count, rows: lectures } = await Lecture.findAndCountAll({
                where: { created_by: lecturer.id },
                include: [
                    {
                        model: LectureRating,
                        as: 'ratings',
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
                        order: [['created_at', 'DESC']]
                    }
                ],
                order: [['created_at', 'DESC']],
                limit,
                offset
            });

            const lecturesWithStats = await Promise.all(
                lectures.map(async (lecture) => {
                    const stats = await LectureRating.getAverageRating(lecture.id);
                    return {
                        ...lecture.toJSON(),
                        statistics: stats
                    };
                })
            );

            res.status(200).json({
                success: true,
                message: 'My lecture ratings retrieved successfully',
                data: {
                    lectures: lecturesWithStats,
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

    // GET /api/lectures/:lectureId/my-rating - Lấy rating của student hiện tại cho bài giảng
    getMyRating: async (req, res, next) => {
        try {
            const { lectureId } = req.params;
            const userId = req.user.id;

            const student = await Student.findOne({ where: { account_id: userId } });
            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: 'Only students can access this endpoint'
                });
            }

            const rating = await LectureRating.findOne({
                where: {
                    lecture_id: lectureId,
                    student_id: student.id
                }
            });

            res.status(200).json({
                success: true,
                message: 'My rating retrieved successfully',
                data: rating
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = lectureRatingController; 
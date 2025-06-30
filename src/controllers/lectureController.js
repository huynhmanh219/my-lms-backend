
const { Lecture, Chapter, Subject, LearningMaterial, Lecturer, sequelize } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../services/paginationService');

const lectureController = {

    // GET /lectures 
    getLectures: async (req, res, next) => {
        try {
            const { page = 1, size = 10, search, chapter_id, is_published } = req.query;
            const { limit, offset } = getPagination(page, size);

            const whereConditions = {};
            
            if (search) {
                whereConditions[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { content: { [Op.like]: `%${search}%` } }
                ];
            }

            if (chapter_id) {
                whereConditions.chapter_id = chapter_id;
            }

            if (is_published !== undefined) {
                whereConditions.is_published = is_published === 'true';
            }

            const lectures = await Lecture.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Chapter,
                        as: 'chapter',
                        attributes: ['id', 'title', 'subject_id'],
                        include: [
                            {
                                model: Subject,
                                as: 'subject',
                                attributes: ['id', 'subject_name', 'subject_code']
                            }
                        ]
                    }
                ],
                limit,
                offset,
                order: [['chapter_id', 'ASC'], ['order_index', 'ASC'], ['created_at', 'DESC']],
                distinct: true
            });

            const response = getPagingData(lectures, page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Lectures retrieved successfully',
                data: response
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /lectures/:id 
    getLecture: async (req, res, next) => {
        try {
            const { id } = req.params;

            const lecture = await Lecture.findByPk(id, {
                include: [
                    {
                        model: Chapter,
                        as: 'chapter',
                        attributes: ['id', 'title', 'description', 'subject_id'],
                        include: [
                            {
                                model: Subject,
                                as: 'subject',
                                attributes: ['id', 'subject_name', 'subject_code', 'description'],
                                include: [
                                    {
                                        model: Lecturer,
                                        as: 'lecturer',
                                        attributes: ['id', 'first_name', 'last_name', 'title', 'department']
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

            if (!lecture) {
                return res.status(404).json({
                    success: false,
                    message: 'Lecture not found'
                });
            }

            const lectureData = lecture.toJSON();
            lectureData.duration_formatted = lecture.getDurationFormatted();

            res.status(200).json({
                success: true,
                message: 'Lecture retrieved successfully',
                data: lectureData
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /lectures 
    createLecture: async (req, res, next) => {
        try {
            const {
                chapter_id,
                title,
                content,
                video_url,
                duration_minutes,
                order_index,
                is_published = false
            } = req.body;

            const chapter = await Chapter.findByPk(chapter_id);
            if (!chapter) {
                return res.status(404).json({
                    success: false,
                    message: 'Chapter not found'
                });
            }

            let finalOrderIndex = order_index;
            if (!finalOrderIndex) {
                const maxOrder = await Lecture.max('order_index', {
                    where: { chapter_id }
                });
                finalOrderIndex = (maxOrder || 0) + 1;
            }

            const lecture = await Lecture.create({
                chapter_id,
                title,
                content,
                video_url,
                duration_minutes,
                order_index: finalOrderIndex,
                is_published
            });

            const createdLecture = await Lecture.findByPk(lecture.id, {
                include: [
                    {
                        model: Chapter,
                        as: 'chapter',
                        attributes: ['id', 'title', 'subject_id']
                    }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Lecture created successfully',
                data: createdLecture
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /lectures/:id 
    updateLecture: async (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                chapter_id,
                title,
                content,
                video_url,
                duration_minutes,
                order_index,
                is_published
            } = req.body;

            const lecture = await Lecture.findByPk(id);
            if (!lecture) {
                return res.status(404).json({
                    success: false,
                    message: 'Lecture not found'
                });
            }

            if (chapter_id && chapter_id !== lecture.chapter_id) {
                const chapter = await Chapter.findByPk(chapter_id);
                if (!chapter) {
                    return res.status(404).json({
                        success: false,
                        message: 'Chapter not found'
                    });
                }
            }

            await lecture.update({
                chapter_id: chapter_id || lecture.chapter_id,
                title: title || lecture.title,
                content: content !== undefined ? content : lecture.content,
                video_url: video_url !== undefined ? video_url : lecture.video_url,
                duration_minutes: duration_minutes !== undefined ? duration_minutes : lecture.duration_minutes,
                order_index: order_index !== undefined ? order_index : lecture.order_index,
                is_published: is_published !== undefined ? is_published : lecture.is_published
            });

            const updatedLecture = await Lecture.findByPk(id, {
                include: [
                    {
                        model: Chapter,
                        as: 'chapter',
                        attributes: ['id', 'title', 'subject_id']
                    }
                ]
            });

            res.status(200).json({
                success: true,
                message: 'Lecture updated successfully',
                data: updatedLecture
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /lectures/:id 
    deleteLecture: async (req, res, next) => {
        try {
            const { id } = req.params;

            const lecture = await Lecture.findByPk(id);
            if (!lecture) {
                return res.status(404).json({
                    success: false,
                    message: 'Lecture not found'
                });
            }

            await lecture.destroy();

            res.status(200).json({
                success: true,
                message: 'Lecture deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /lectures/:id/attachments    
    getLectureAttachments: async (req, res, next) => {
        try {
            const { id } = req.params;

            // Verify lecture exists
            const lecture = await Lecture.findByPk(id);
            if (!lecture) {
                return res.status(404).json({
                    success: false,
                    message: 'Lecture not found'
                });
            }

            const attachments = await LearningMaterial.findAll({
                where: {
                    chapter_id: lecture.chapter_id,
                },
                include: [
                    {
                        model: Lecturer,
                        as: 'uploader',
                        attributes: ['id', 'first_name', 'last_name', 'title']
                    }
                ],
                order: [['created_at', 'DESC']]
            });

            const formattedAttachments = attachments.map(attachment => {
                const attachmentData = attachment.toJSON();
                attachmentData.file_size_formatted = attachment.getFileSizeFormatted();
                return attachmentData;
            });

            res.status(200).json({
                success: true,
                message: 'Lecture attachments retrieved successfully',
                data: formattedAttachments
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /chapters 
    getChapters: async (req, res, next) => {
        try {
            const { page = 1, size = 10, search, subject_id, status } = req.query;
            const { limit, offset } = getPagination(page, size);

            const whereConditions = {};
            
            if (search) {
                whereConditions[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            if (subject_id) {
                whereConditions.subject_id = subject_id;
            }

            if (status) {
                whereConditions.status = status;
            }

            const chapters = await Chapter.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code', 'description']
                    },
                    {
                        model: Lecture,
                        as: 'lectures',
                        attributes: ['id', 'title', 'duration_minutes', 'is_published']
                    }
                ],
                limit,
                offset,
                order: [['subject_id', 'ASC'], ['order_index', 'ASC'], ['created_at', 'DESC']],
                distinct: true
            });

            const response = getPagingData(chapters, page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Chapters retrieved successfully',
                data: response
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /chapters/:id 
    getChapter: async (req, res, next) => {
        try {
            const { id } = req.params;

            const chapter = await Chapter.findByPk(id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code', 'description'],
                        include: [
                            {
                                model: Lecturer,
                                as: 'lecturer',
                                attributes: ['id', 'first_name', 'last_name', 'title', 'department']
                            }
                        ]
                    },
                    {
                        model: Lecture,
                        as: 'lectures',
                        attributes: ['id', 'title', 'content', 'video_url', 'duration_minutes', 'order_index', 'is_published'],
                        order: [['order_index', 'ASC']]
                    }
                ]
            });

            if (!chapter) {
                return res.status(404).json({
                    success: false,
                    message: 'Chapter not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Chapter retrieved successfully',
                data: chapter
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /chapters 
    createChapter: async (req, res, next) => {
        try {
            const {
                subject_id,
                title,
                description,
                order_index,
                status = 'active'
            } = req.body;

            const subject = await Subject.findByPk(subject_id);
            if (!subject) {
                return res.status(404).json({
                    success: false,
                    message: 'Subject not found'
                });
            }

            let finalOrderIndex = order_index;
            if (!finalOrderIndex) {
                const maxOrder = await Chapter.max('order_index', {
                    where: { subject_id }
                });
                finalOrderIndex = (maxOrder || 0) + 1;
            }

            const chapter = await Chapter.create({
                subject_id,
                title,
                description,
                order_index: finalOrderIndex,
                status
            });

            const createdChapter = await Chapter.findByPk(chapter.id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code']
                    }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Chapter created successfully',
                data: createdChapter
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /chapters/:id 
    updateChapter: async (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                subject_id,
                title,
                description,
                order_index,
                status
            } = req.body;

            const chapter = await Chapter.findByPk(id);
            if (!chapter) {
                return res.status(404).json({
                    success: false,
                    message: 'Chapter not found'
                });
            }

            if (subject_id && subject_id !== chapter.subject_id) {
                const subject = await Subject.findByPk(subject_id);
                if (!subject) {
                    return res.status(404).json({
                        success: false,
                        message: 'Subject not found'
                    });
                }
            }

            await chapter.update({
                subject_id: subject_id || chapter.subject_id,
                title: title || chapter.title,
                description: description !== undefined ? description : chapter.description,
                order_index: order_index !== undefined ? order_index : chapter.order_index,
                status: status || chapter.status
            });

            const updatedChapter = await Chapter.findByPk(id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'subject_name', 'subject_code']
                    }
                ]
            });

            res.status(200).json({
                success: true,
                message: 'Chapter updated successfully',
                data: updatedChapter
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /chapters/:id 
    deleteChapter: async (req, res, next) => {
        try {
            const { id } = req.params;

            const chapter = await Chapter.findByPk(id, {
                include: [
                    {
                        model: Lecture,
                        as: 'lectures'
                    }
                ]
            });

            if (!chapter) {
                return res.status(404).json({
                    success: false,
                    message: 'Chapter not found'
                });
            }

            if (chapter.lectures && chapter.lectures.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete chapter with existing lectures. Please delete lectures first.'
                });
            }

            await chapter.destroy();

            res.status(200).json({
                success: true,
                message: 'Chapter deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /chapters/:id/lectures 
    getChapterLectures: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page = 1, size = 20 } = req.query;
            const { limit, offset } = getPagination(page, size);

            const chapter = await Chapter.findByPk(id);
            if (!chapter) {
                return res.status(404).json({
                    success: false,
                    message: 'Chapter not found'
                });
            }

            const lectures = await Lecture.findAndCountAll({
                where: { chapter_id: id },
                limit,
                offset,
                order: [['order_index', 'ASC'], ['created_at', 'ASC']]
            });

            const response = getPagingData(lectures, page, limit);

            response.items = response.items.map(lecture => {
                const lectureData = lecture.toJSON();
                lectureData.duration_formatted = lecture.getDurationFormatted();
                return lectureData;
            });

            res.status(200).json({
                success: true,
                message: 'Chapter lectures retrieved successfully',
                data: response,
                chapter: {
                    id: chapter.id,
                    title: chapter.title,
                    description: chapter.description
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /lectures/:id/permissions 
    getLecturePermissions: async (req, res, next) => {
        try {
            const { id } = req.params;

            const lecture = await Lecture.findByPk(id, {
                include: [
                    {
                        model: Chapter,
                        as: 'chapter',
                        include: [
                            {
                                model: Subject,
                                as: 'subject',
                                attributes: ['id', 'subject_name', 'subject_code']
                            }
                        ]
                    }
                ]
            });

            if (!lecture) {
                return res.status(404).json({
                    success: false,
                    message: 'Lecture not found'
                });
            }

            const permissions = {
                lecture_id: lecture.id,
                is_published: lecture.is_published,
                chapter_status: lecture.chapter.status,
                subject_info: lecture.chapter.subject,
                can_edit: true, 
                can_delete: true, 
                can_publish: true, 
                visibility: lecture.is_published ? 'public' : 'private',
                created_at: lecture.created_at,
                updated_at: lecture.updated_at
            };

            res.status(200).json({
                success: true,
                message: 'Lecture permissions retrieved successfully',
                data: permissions
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /lectures/:id/permissions 
    updateLecturePermissions: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { is_published, visibility } = req.body;

            const lecture = await Lecture.findByPk(id);
            if (!lecture) {
                return res.status(404).json({
                    success: false,
                    message: 'Lecture not found'
                });
            }

            const updateData = {};
            
            if (is_published !== undefined) {
                updateData.is_published = is_published;
            }
            
            if (visibility) {
                updateData.is_published = visibility === 'public';
            }

            await lecture.update(updateData);

            res.status(200).json({
                success: true,
                message: 'Lecture permissions updated successfully',
                data: {
                    lecture_id: lecture.id,
                    is_published: lecture.is_published,
                    visibility: lecture.is_published ? 'public' : 'private'
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /my-lectures 
    getMyLectures: async (req, res, next) => {
        try {
            const { page = 1, size = 10, status, subject_id } = req.query;
            const { limit, offset } = getPagination(page, size);
            const userId = req.user.id;
            const userRole = req.user.role;

            let whereConditions = {};
            let subjectWhere = {};

            if (userRole === 'lecturer') {
                const lecturer = await Lecturer.findOne({
                    where: { account_id: userId }
                });

                if (!lecturer) {
                    return res.status(404).json({
                        success: false,
                        message: 'Lecturer profile not found'
                    });
                }

                subjectWhere.lecturer_id = lecturer.id;
            }

            if (status === 'published') {
                whereConditions.is_published = true;
            } else if (status === 'draft') {
                whereConditions.is_published = false;
            }

            if (subject_id) {
                subjectWhere.id = subject_id;
            }

            const lectures = await Lecture.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Chapter,
                        as: 'chapter',
                        include: [
                            {
                                model: Subject,
                                as: 'subject',
                                where: subjectWhere,
                                attributes: ['id', 'subject_name', 'subject_code'],
                                include: [
                                    {
                                        model: Lecturer,
                                        as: 'lecturer',
                                        attributes: ['id', 'first_name', 'last_name']
                                    }
                                ]
                            }
                        ]
                    }
                ],
                limit,
                offset,
                order: [['updated_at', 'DESC']],
                distinct: true
            });

            const response = getPagingData(lectures, page, limit);
                    
            response.items = response.items.map(lecture => {
                const lectureData = lecture.toJSON();
                lectureData.duration_formatted = lecture.getDurationFormatted();
                return lectureData;
            });

            res.status(200).json({
                success: true,
                message: 'My lectures retrieved successfully',
                data: response
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = lectureController; 

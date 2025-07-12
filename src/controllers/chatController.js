const { CourseSection, StudentCourseSection, ClassChatMessage, Account } = require('../models');
const { NotFoundError, ValidationError } = require('../middleware/errorHandler');

const chatController = {
    // GET /classes/:id/chat?limit=50
    getMessages: async (req, res, next) => {
        try {
            const { id } = req.params; // course_section_id
            const limit = parseInt(req.query.limit, 10) || 50;

            const classSection = await CourseSection.findByPk(id);
            if (!classSection) throw new NotFoundError('Class not found');

            // TODO: verify membership if needed

            const messages = await ClassChatMessage.findAll({
                where: { course_section_id: id },
                include: [{ model: Account, as: 'sender', attributes: ['id', 'email'], include:[{model: require('../models').Student, as:'student', attributes:['student_id']}] }],
                order: [['created_at', 'DESC']],
                limit
            });

            const mapped = messages.reverse().map(m=>({
                id:m.id,
                course_section_id:m.course_section_id,
                sender_id:m.sender_id,
                sender_student_id: m.sender?.student?.student_id || null,
                sender_email:m.sender?.email,
                content:m.content,
                created_at:m.created_at
            }));

            res.status(200).json({
                status: 'success',
                message: 'Messages retrieved',
                data: mapped
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /classes/:id/chat { content }
    postMessage: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const senderId = req.user.id;

            if (!content || content.trim() === '') throw new ValidationError('Content required');

            // Check class exists
            const classSection = await CourseSection.findByPk(id);
            if (!classSection) throw new NotFoundError('Class not found');

            // Optional: verify user is lecturer of class or enrolled student
            // Skipped for brevity

            const msg = await ClassChatMessage.create({
                course_section_id: id,
                sender_id: senderId,
                content
            });

            res.status(201).json({
                status: 'success',
                message: 'Message sent',
                data: msg
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = chatController; 
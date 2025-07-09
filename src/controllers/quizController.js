const { Quiz, Question, Answer, Submission, Response, Subject, CourseSection, Lecturer, Student, sequelize } = require('../models');
const { Op } = require('sequelize');
const { getOffsetLimit, getPaginationData, getPagingData } = require('../services/paginationService');

const quizController = {

    // GET /quizzes 
    getQuizzes: async (req, res, next) => {
        try {
            const { page = 1, size = 10, search, subject_id, status, lecturer_id } = req.query;
            const { limit, offset } = getOffsetLimit(page, size);

            const whereConditions = {};
            
            if (search) {
                whereConditions[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            if (subject_id) whereConditions.subject_id = subject_id;
            if (status) whereConditions.status = status;
            if (lecturer_id) whereConditions.lecturer_id = lecturer_id;

            const quizzes = await Quiz.findAndCountAll({
                where: whereConditions,
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: CourseSection, as: 'courseSection', attributes: ['id', 'section_name'] },
                    { model: Lecturer, as: 'lecturer', attributes: ['id', 'first_name', 'last_name'] },
                    { 
                        model: Question, 
                        as: 'questions',
                        attributes: ['id'],
                        required: false
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']],
                distinct: true
            });

            // Transform data to include question count
            const transformedQuizzes = {
                ...quizzes,
                rows: quizzes.rows.map(quiz => {
                    const quizData = quiz.toJSON();
                    return {
                        ...quizData,
                        question_count: quizData.questions ? quizData.questions.length : 0,
                        questions: undefined // Remove questions array from response
                    };
                })
            };

            const response = getPagingData(transformedQuizzes, page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Quizzes retrieved successfully',
                data: response
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /quizzes/:id 
    getQuiz: async (req, res, next) => {
        try {
            const { id } = req.params;

            const quiz = await Quiz.findByPk(id, {
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code', 'description'] },
                    { model: CourseSection, as: 'courseSection', attributes: ['id', 'section_name'] },
                    { model: Lecturer, as: 'lecturer', attributes: ['id', 'first_name', 'last_name'] },
                    { 
                        model: Question, 
                        as: 'questions', 
                        attributes: ['id', 'question_text', 'question_type', 'points', 'order_index'],
                        order: [['order_index', 'ASC']]
                    }
                ]
            });

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            const quizData = quiz.toJSON();
            quizData.time_remaining = quiz.getTimeRemainingMinutes();
            quizData.is_active = quiz.isActive();
            quizData.is_upcoming = quiz.isUpcoming();
            quizData.is_expired = quiz.isExpired();

            res.status(200).json({
                success: true,
                message: 'Quiz retrieved successfully',
                data: quizData
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /quizzes 
    createQuiz: async (req, res, next) => {
        try {
            const {
                title,
                description,
                subject_id,
                course_section_id,
                total_points = 100,
                time_limit,
                attempts_allowed = 3,
                shuffle_questions = false,
                shuffle_answers = false,
                show_results = true,
                show_correct_answers = true,
                start_time,
                end_time,
                instructions,
                passing_score
            } = req.body;

            const userId = req.user.id;
            const lecturer = await Lecturer.findOne({ where: { account_id: userId } });
            
            if (!lecturer) {
                return res.status(403).json({
                    success: false,
                    message: 'Only lecturers can create quizzes'
                });
            }

            // Validate subject exists
            const subject = await Subject.findByPk(subject_id);
            if (!subject) {
                return res.status(404).json({
                    success: false,
                    message: 'Subject not found'
                });
            }

            const quiz = await Quiz.create({
                title,
                description,
                subject_id,
                course_section_id,
                lecturer_id: lecturer.id,
                total_points,
                time_limit,
                attempts_allowed,
                shuffle_questions,
                shuffle_answers,
                show_results,
                show_correct_answers,
                start_time,
                end_time,
                instructions,
                passing_score
            });

            const createdQuiz = await Quiz.findByPk(quiz.id, {
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: CourseSection, as: 'courseSection', attributes: ['id', 'section_name'] }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Quiz created successfully',
                data: createdQuiz
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /quizzes/:id 
    updateQuiz: async (req, res, next) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const quiz = await Quiz.findByPk(id);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            if (quiz.status === 'published') {
                const submissionCount = await Submission.count({ where: { quiz_id: id } });
                if (submissionCount > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot update quiz with existing submissions'
                    });
                }
            }

            await quiz.update(updateData);

            const updatedQuiz = await Quiz.findByPk(id, {
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: CourseSection, as: 'courseSection', attributes: ['id', 'section_name'] }
                ]
            });

            res.status(200).json({
                success: true,
                message: 'Quiz updated successfully',
                data: updatedQuiz
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /quizzes/:id 
    deleteQuiz: async (req, res, next) => {
        try {
            const { id } = req.params;

            const quiz = await Quiz.findByPk(id);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            const submissionCount = await Submission.count({ where: { quiz_id: id } });
            if (submissionCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete quiz with existing submissions'
                });
            }

            await quiz.destroy();

            res.status(200).json({
                success: true,
                message: 'Quiz deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },
    forceDeleteQuiz: async (req, res, next) => {
        try {
            const { id } = req.params;
            await Quiz.destroy({ where: { id } });
            res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
        } catch (error) {
            next(error);
        }
    },
    // POST /quizzes/:id/publish 
    publishQuiz: async (req, res, next) => {
        try {
            const { id } = req.params;

            const quiz = await Quiz.findByPk(id, {
                include: [{ model: Question, as: 'questions' }]
            });

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            if (quiz.status === 'published') {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz is already published'
                });
            }

            if (!quiz.questions || quiz.questions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot publish quiz without questions'
                });
            }

            await quiz.update({ status: 'published' });

            res.status(200).json({
                success: true,
                message: 'Quiz published successfully',
                data: { id: quiz.id, status: 'published' }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /quizzes/:id/close 
    closeQuiz: async (req, res, next) => {
        try {
            const { id } = req.params;

            const quiz = await Quiz.findByPk(id);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            if (quiz.status === 'closed') {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz is already closed'
                });
            }

            await Submission.update(
                { status: 'submitted', submitted_at: new Date() },
                { where: { quiz_id: id, status: 'in_progress' } }
            );

            await quiz.update({ status: 'closed' });

            res.status(200).json({
                success: true,
                message: 'Quiz closed successfully',
                data: { id: quiz.id, status: 'closed' }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /quizzes/:id/questions 
    getQuizQuestions: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { include_answers = false } = req.query;

            const quiz = await Quiz.findByPk(id);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            const includeOptions = include_answers === 'true' ? [
                {
                    model: Answer,
                    as: 'answers',
                    attributes: ['id', 'answer_text', 'is_correct', 'order_index', 'explanation'],
                    order: [['order_index', 'ASC']]
                }
            ] : [];

            const questions = await Question.findAll({
                where: { quiz_id: id },
                include: includeOptions,
                order: [['order_index', 'ASC'], ['created_at', 'ASC']]
            });

            res.status(200).json({
                success: true,
                message: 'Quiz questions retrieved successfully',
                data: questions,
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    total_questions: questions.length
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /questions/:id 
    getQuestion: async (req, res, next) => {
        try {
            const { id } = req.params;

            const question = await Question.findByPk(id, {
                include: [
                    {
                        model: Quiz,
                        as: 'quiz',
                        attributes: ['id', 'title', 'status']
                    },
                    {
                        model: Answer,
                        as: 'answers',
                        attributes: ['id', 'answer_text', 'is_correct', 'order_index', 'explanation'],
                        order: [['order_index', 'ASC']]
                    }
                ]
            });

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Question retrieved successfully',
                data: question
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /questions 
    createQuestion: async (req, res, next) => {
        try {
            const {
                quiz_id,
                question_text,
                question_type = 'multiple_choice',
                points = 1,
                order_index,
                explanation,
                is_required = true,
                image_url,
                time_limit,
                answers = []
            } = req.body;

            const quiz = await Quiz.findByPk(quiz_id);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            if (quiz.status === 'published') {
                const submissionCount = await Submission.count({ where: { quiz_id } });
                if (submissionCount > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot add questions to quiz with existing submissions'
                    });
                }
            }

            let finalOrderIndex = order_index;
            if (!finalOrderIndex) {
                const maxOrder = await Question.max('order_index', { where: { quiz_id } });
                finalOrderIndex = (maxOrder || 0) + 1;
            }

            const transaction = await sequelize.transaction();

            try {
                const question = await Question.create({
                    quiz_id,
                    question_text,
                    question_type,
                    points,
                    order_index: finalOrderIndex,
                    explanation,
                    is_required,
                    image_url,
                    time_limit
                }, { transaction });

                if (answers.length > 0) {
                    const answerData = answers.map((answer, index) => ({
                        question_id: question.id,
                        answer_text: answer.answer_text,
                        is_correct: answer.is_correct || false,
                        order_index: answer.order_index || index + 1,
                        explanation: answer.explanation,
                        image_url: answer.image_url
                    }));

                    await Answer.bulkCreate(answerData, { transaction });
                }

                const totalPoints = await Question.sum('points', { 
                    where: { quiz_id },
                    transaction
                });
                await quiz.update({ total_points: totalPoints || 0 }, { transaction });

                await transaction.commit();

                const createdQuestion = await Question.findByPk(question.id, {
                    include: [
                        {
                            model: Answer,
                            as: 'answers',
                            order: [['order_index', 'ASC']]
                        }
                    ]
                });

                res.status(201).json({
                    success: true,
                    message: 'Question created successfully',
                    data: createdQuestion
                });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            next(error);
        }
    },

    // PUT /questions/:id 
    updateQuestion: async (req, res, next) => {
        try {
            const { id } = req.params;
            const {
                question_text,
                question_type,
                points,
                order_index,
                explanation,
                is_required,
                image_url,
                time_limit,
                answers
            } = req.body;

            const question = await Question.findByPk(id, {
                include: [{ model: Quiz, as: 'quiz' }]
            });

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            if (question.quiz.status === 'published') {
                const submissionCount = await Submission.count({ 
                    where: { quiz_id: question.quiz_id } 
                });
                if (submissionCount > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot update question in quiz with existing submissions'
                    });
                }
            }

            const transaction = await sequelize.transaction();

            try {
                await question.update({
                    question_text: question_text || question.question_text,
                    question_type: question_type || question.question_type,
                    points: points !== undefined ? points : question.points,
                    order_index: order_index !== undefined ? order_index : question.order_index,
                    explanation: explanation !== undefined ? explanation : question.explanation,
                    is_required: is_required !== undefined ? is_required : question.is_required,
                    image_url: image_url !== undefined ? image_url : question.image_url,
                    time_limit: time_limit !== undefined ? time_limit : question.time_limit
                }, { transaction });

                if (answers && Array.isArray(answers)) {
                    await Answer.destroy({ 
                        where: { question_id: id },
                        transaction
                    });

                    if (answers.length > 0) {
                        const answerData = answers.map((answer, index) => ({
                            question_id: id,
                            answer_text: answer.answer_text,
                            is_correct: answer.is_correct || false,
                            order_index: answer.order_index || index + 1,
                            explanation: answer.explanation,
                            image_url: answer.image_url
                        }));

                        await Answer.bulkCreate(answerData, { transaction });
                    }
                }

                const totalPoints = await Question.sum('points', { 
                    where: { quiz_id: question.quiz_id },
                    transaction
                });
                await Quiz.update(
                    { total_points: totalPoints || 0 },
                    { where: { id: question.quiz_id }, transaction }
                );

                await transaction.commit();

                const updatedQuestion = await Question.findByPk(id, {
                    include: [
                        {
                            model: Answer,
                            as: 'answers',
                            order: [['order_index', 'ASC']]
                        }
                    ]
                });

                res.status(200).json({
                    success: true,
                    message: 'Question updated successfully',
                    data: updatedQuestion
                });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            next(error);
        }
    },

    // DELETE /questions/:id 
    deleteQuestion: async (req, res, next) => {
        try {
            const { id } = req.params;

            const question = await Question.findByPk(id, {
                include: [{ model: Quiz, as: 'quiz' }]
            });

            if (!question) {
                return res.status(404).json({
                    success: false,
                    message: 'Question not found'
                });
            }

            if (question.quiz.status === 'published') {
                const submissionCount = await Submission.count({ 
                    where: { quiz_id: question.quiz_id } 
                });
                if (submissionCount > 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Cannot delete question from quiz with existing submissions'
                    });
                }
            }

            const transaction = await sequelize.transaction();

            try {
                await question.destroy({ transaction });

                const totalPoints = await Question.sum('points', { 
                    where: { quiz_id: question.quiz_id },
                    transaction
                });
                await Quiz.update(
                    { total_points: totalPoints || 0 },
                    { where: { id: question.quiz_id }, transaction }
                );

                await transaction.commit();

                res.status(200).json({
                    success: true,
                    message: 'Question deleted successfully'
                });
            } catch (error) {
                await transaction.rollback();
                throw error;
            }
        } catch (error) {
            next(error);
        }
    },

    // POST /questions/import 
    importQuestions: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const { quiz_id } = req.body;

            const quiz = await Quiz.findByPk(quiz_id);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Questions imported successfully (implementation pending)',
                data: { 
                    quiz_id,
                    file_name: req.file.originalname,
                    imported_count: 0
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /questions/export 
    exportQuestions: async (req, res, next) => {
        try {
            const { quiz_id, format = 'json' } = req.query;

            if (!quiz_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz ID is required'
                });
            }

            const questions = await Question.findAll({
                where: { quiz_id },
                include: [
                    {
                        model: Answer,
                        as: 'answers',
                        order: [['order_index', 'ASC']]
                    }
                ],
                order: [['order_index', 'ASC']]
            });

            if (format === 'json') {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="quiz_${quiz_id}_questions.json"`);
                res.status(200).json({
                    quiz_id,
                    exported_at: new Date(),
                    questions_count: questions.length,
                    questions: questions
                });
            } else {
                // TODO: Implement CSV export
                res.status(400).json({
                    success: false,
                    message: 'Only JSON format is currently supported'
                });
            }
        } catch (error) {
            next(error);
        }
    },

    // GET /quizzes/:id/start 
    startQuiz: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const quiz = await Quiz.findByPk(id, {
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { 
                        model: Question, 
                        as: 'questions',
                        attributes: ['id', 'question_text', 'question_type', 'points', 'order_index', 'time_limit'],
                        include: [
                            {
                                model: Answer,
                                as: 'answers',
                                attributes: ['id', 'answer_text', 'order_index']
                            }
                        ]
                    }
                ]
            });

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            if (!quiz.isActive()) {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz is not currently available'
                });
            }

            const student = await Student.findOne({ where: { account_id: userId } });
            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: 'Only students can take quizzes'
                });
            }

            const attemptCount = await Submission.count({
                where: { quiz_id: id, student_id: student.id }
            });

            if (attemptCount >= quiz.attempts_allowed) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum attempts reached for this quiz'
                });
            }

            const activeSubmission = await Submission.findOne({
                where: { 
                    quiz_id: id, 
                    student_id: student.id, 
                    status: 'in_progress' 
                }
            });

            if (activeSubmission) {
                return res.status(400).json({
                    success: false,
                    message: 'You already have an active attempt for this quiz',
                    submission_id: activeSubmission.id
                });
            }

            let questions = quiz.questions;
            if (quiz.shuffle_questions) {
                questions = [...questions].sort(() => Math.random() - 0.5);
            }

            if (quiz.shuffle_answers) {
                questions = questions.map(question => ({
                    ...question.toJSON(),
                    answers: [...question.answers].sort(() => Math.random() - 0.5)
                }));
            }

            res.status(200).json({
                success: true,
                message: 'Quiz ready to start',
                data: {
                    quiz: {
                        id: quiz.id,
                        title: quiz.title,
                        description: quiz.description,
                        instructions: quiz.instructions,
                        time_limit: quiz.time_limit,
                        total_points: quiz.total_points,
                        show_results: quiz.show_results,
                        questions_count: questions.length
                    },
                    questions: questions.map(q => ({
                        id: q.id,
                        question_text: q.question_text,
                        question_type: q.question_type,
                        points: q.points,
                        time_limit: q.time_limit,
                        answers: q.answers.map(a => ({
                            id: a.id,
                            answer_text: a.answer_text
                        }))
                    })),
                    attempt_number: attemptCount + 1,
                    time_remaining: quiz.getTimeRemainingMinutes()
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /quiz-attempts 
    createQuizAttempt: async (req, res, next) => {
        try {
            const { quiz_id } = req.body;
            const userId = req.user.id;

            const quiz = await Quiz.findByPk(quiz_id);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            if (!quiz.isActive()) {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz is not currently available'
                });
            }

            const student = await Student.findOne({ where: { account_id: userId } });
            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: 'Only students can create quiz attempts'
                });
            }

            const validAttempts = await Submission.count({
                where: { 
                    quiz_id, 
                    student_id: student.id,
                    status: { [Op.in]: ['in_progress', 'submitted', 'graded'] }
                }
            });

            if (validAttempts >= quiz.attempts_allowed) {
                return res.status(400).json({
                    success: false,
                    message: 'Maximum attempts reached'
                });
            }

            const submission = await Submission.create({
                quiz_id,
                student_id: student.id,
                attempt_number: validAttempts + 3,
                max_score: quiz.total_points,
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
            });

            res.status(201).json({
                success: true,
                message: 'Quiz attempt started successfully',
                data: {
                    submission_id: submission.id,
                    attempt_number: submission.attempt_number,
                    started_at: submission.started_at
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /quiz-attempts/:id 
    getQuizAttempt: async (req, res, next) => {
        try {
            const { id } = req.params;

            const submission = await Submission.findByPk(id, {
                include: [
                    {
                        model: Quiz,
                        as: 'quiz',
                        attributes: ['id', 'title', 'time_limit', 'show_results']
                    },
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'first_name', 'last_name']
                    },
                    {
                        model: Response,
                        as: 'responses',
                        include: [
                            {
                                model: Question,
                                as: 'question',
                                attributes: ['id', 'question_text', 'question_type', 'points']
                            },
                            {
                                model: Answer,
                                as: 'selectedAnswer',
                                attributes: ['id', 'answer_text', 'is_correct']
                            }
                        ]
                    }
                ]
            });

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found'
                });
            }

            const submissionData = submission.toJSON();
            submissionData.time_spent_formatted = submission.getTimeSpentFormatted();
            submissionData.grade = submission.getGrade();

            res.status(200).json({
                success: true,
                message: 'Quiz attempt retrieved successfully',
                data: submissionData
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /quiz-attempts/:id/answer 
    submitAnswer: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { question_id, answer_id, answer_text, time_spent } = req.body;

            const submission = await Submission.findByPk(id, {
                include: [{ model: Quiz, as: 'quiz' }]
            });

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found'
                });
            }

            if (submission.status !== 'in_progress') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot submit answer to completed quiz attempt'
                });
            }

            const question = await Question.findByPk(question_id, {
                include: [{ model: Answer, as: 'answers' }]
            });

            if (!question || question.quiz_id !== submission.quiz_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid question for this quiz'
                });
            }

            let response = await Response.findOne({
                where: { submission_id: id, question_id }
            });

            let isCorrect = false;
            let pointsEarned = 0;

            if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
                const selectedAnswer = question.answers.find(a => a.id === answer_id);
                isCorrect = selectedAnswer?.is_correct || false;
                pointsEarned = isCorrect ? question.points : 0;
            } else {
                isCorrect = null;
                pointsEarned = null;
            }

            if (response) {
                await response.update({
                    answer_id,
                    answer_text,
                    is_correct: isCorrect,
                    points_earned: pointsEarned,
                    time_spent,
                    attempt_count: response.attempt_count + 1
                });
            } else {
                response = await Response.create({
                    submission_id: id,
                    question_id,
                    answer_id,
                    answer_text,
                    is_correct: isCorrect,
                    points_earned: pointsEarned,
                    time_spent
                });
            }

            res.status(200).json({
                success: true,
                message: 'Answer submitted successfully',
                data: {
                    response_id: response.id,
                    is_correct: isCorrect,
                    points_earned: pointsEarned
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /quiz-attempts/:id/flag 
    flagQuestion: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { question_id, reason } = req.body;

            const submission = await Submission.findByPk(id);
            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found'
                });
            }

            if (submission.status !== 'in_progress') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot flag questions in completed attempt'
                });
            }

            await Response.update(
                { is_flagged: true },
                { where: { submission_id: id, question_id } }
            );

            if (!submission.is_flagged) {
                await submission.update({
                    is_flagged: true,
                    flagged_reason: reason || 'Question flagged during attempt'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Question flagged successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /quiz-attempts/:id/submit 
    submitQuizAttempt: async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const submission = await Submission.findByPk(id, {
                include: [
                    {
                        model: Quiz,
                        as: 'quiz',
                        attributes: ['id', 'title', 'total_points', 'passing_score']
                    },
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'account_id']
                    },
                    {
                        model: Response,
                        as: 'responses',
                        attributes: ['question_id', 'is_correct', 'points_earned']
                    }
                ]
            });

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found'
                });
            }

            // Check ownership
            if (submission.student.account_id !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to submit this quiz attempt'
                });
            }

            if (submission.status !== 'in_progress') {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz attempt is already submitted'
                });
            }

            const endTime = new Date();
            const timeSpent = Math.floor((endTime - submission.started_at) / 1000); // seconds

            // Calculate auto-graded score
            const autoGradedResponses = submission.responses.filter(r => r.is_correct !== null);
            const currentScore = autoGradedResponses.reduce((sum, r) => sum + parseFloat(r.points_earned || 0), 0);
            const maxScore = parseFloat(submission.quiz.total_points || 100);
            const percentage = maxScore > 0 ? (currentScore / maxScore * 100) : 0;

            // Update submission
            await submission.update({
                status: 'submitted',
                submitted_at: endTime,
                time_spent: timeSpent,
                score: parseFloat(currentScore.toFixed(2)),
                max_score: parseFloat(maxScore.toFixed(2)),
                percentage: parseFloat(percentage.toFixed(2))
            });

            res.status(200).json({
                success: true,
                message: 'Quiz submitted successfully',
                data: {
                    submission_id: submission.id,
                    score: currentScore,
                    max_score: maxScore,
                    percentage: percentage.toFixed(2),
                    time_spent: timeSpent,
                    submitted_at: endTime
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /quiz-attempts/:id/progress 
    getQuizProgress: async (req, res, next) => {
        try {
            const { id } = req.params;

            const submission = await Submission.findByPk(id, {
                include: [
                    {
                        model: Quiz,
                        as: 'quiz',
                        include: [
                            {
                                model: Question,
                                as: 'questions',
                                attributes: ['id', 'question_type', 'points']
                            }
                        ]
                    },
                    {
                        model: Response,
                        as: 'responses',
                        attributes: ['question_id', 'is_correct', 'points_earned']
                    }
                ]
            });

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found'
                });
            }

            const totalQuestions = submission.quiz.questions.length;
            const answeredQuestions = submission.responses.length;
            const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions * 100).toFixed(1) : 0;

            const autoGradedResponses = submission.responses.filter(r => r.is_correct !== null);
            const currentScore = autoGradedResponses.reduce((sum, r) => sum + parseFloat(r.points_earned || 0), 0);

            res.status(200).json({
                success: true,
                message: 'Quiz progress retrieved successfully',
                data: {
                    submission_id: submission.id,
                    status: submission.status,
                    total_questions: totalQuestions,
                    answered_questions: answeredQuestions,
                    remaining_questions: totalQuestions - answeredQuestions,
                    progress_percentage: progressPercentage,
                    current_score: currentScore,
                    max_possible_score: submission.max_score,
                    time_spent_formatted: submission.getTimeSpentFormatted(),
                    is_flagged: submission.is_flagged
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /quizzes/:id/results 
    getQuizResults: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page = 1, size = 10 } = req.query;
            const { limit, offset } = getOffsetLimit(page, size);

            const quiz = await Quiz.findByPk(id);
            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            const submissions = await Submission.findAndCountAll({
                where: { quiz_id: id, status: { [Op.in]: ['submitted', 'graded'] } },
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'student_id', 'first_name', 'last_name']
                    }
                ],
                limit,
                offset,
                order: [['submitted_at', 'DESC']]
            });

            const response = getPagingData(submissions, page, limit);

            response.data = response.data.map(submission => {
                const data = submission.toJSON();
                data.time_spent_formatted = submission.getTimeSpentFormatted();
                data.grade = submission.getGrade();
                return data;
            });

            const allSubmissions = await Submission.findAll({
                where: { quiz_id: id, status: { [Op.in]: ['submitted', 'graded'] } },
                attributes: ['score', 'percentage', 'time_spent']
            });

            const stats = {
                total_submissions: allSubmissions.length,
                average_score: allSubmissions.length > 0 ? 
                    (allSubmissions.reduce((sum, s) => sum + (s.score || 0), 0) / allSubmissions.length).toFixed(2) : 0,
                average_percentage: allSubmissions.length > 0 ?
                    (allSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / allSubmissions.length).toFixed(1) : 0,
                pass_rate: allSubmissions.length > 0 && quiz.passing_score ?
                    ((allSubmissions.filter(s => (s.percentage || 0) >= quiz.passing_score).length / allSubmissions.length) * 100).toFixed(1) : null
            };

            res.status(200).json({
                success: true,
                message: 'Quiz results retrieved successfully',
                data: response,
                statistics: stats
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /quiz-attempts/:id/result 
    getAttemptResult: async (req, res, next) => {
        try {
            const { id } = req.params;

            const submission = await Submission.findByPk(id, {
                include: [
                    {
                        model: Quiz,
                        as: 'quiz',
                        attributes: ['id', 'title', 'show_results', 'show_correct_answers', 'passing_score']
                    },
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'student_id', 'first_name', 'last_name']
                    },
                    {
                        model: Response,
                        as: 'responses',
                        include: [
                            {
                                model: Question,
                                as: 'question',
                                attributes: ['id', 'question_text', 'question_type', 'points', 'explanation']
                            },
                            {
                                model: Answer,
                                as: 'selectedAnswer',
                                attributes: ['id', 'answer_text', 'is_correct', 'explanation']
                            }
                        ]
                    }
                ]
            });

            if (!submission) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz attempt not found'
                });
            }

            if (submission.status === 'in_progress') {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz attempt is still in progress'
                });
            }

            const submissionData = submission.toJSON();
            submissionData.time_spent_formatted = submission.getTimeSpentFormatted();
            submissionData.grade = submission.getGrade();
            submissionData.passed = submission.quiz.passing_score ? 
                (submission.percentage || 0) >= submission.quiz.passing_score : null;

            res.status(200).json({
                success: true,
                message: 'Attempt result retrieved successfully',
                data: submissionData
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /quiz-attempts/my-attempts 
    getMyAttempts: async (req, res, next) => {
        try {
            console.log('🔍 getMyAttempts called with query:', req.query);
            console.log('🔍 getMyAttempts called with params:', req.params);
            console.log('🔍 User ID:', req.user?.id);
            
            const { page = 1, size = 10, limit, status, quiz_id } = req.query;
            // Use limit if provided, otherwise use size, default to 10
            const pageSize = limit || size || 10;
            const { limit: dbLimit, offset } = getOffsetLimit(page, pageSize);
            const userId = req.user.id;

            console.log('🔍 Processed parameters:', { page, size, limit, pageSize, dbLimit, offset, status, quiz_id });

            const student = await Student.findOne({ where: { account_id: userId } });
            if (!student) {
                return res.status(403).json({
                    success: false,
                    message: 'Only students can view quiz attempts'
                });
            }

            console.log('🔍 Found student:', student.id);

            const whereConditions = { student_id: student.id };
            if (status) {
                whereConditions.status = status;
            }
            if (quiz_id) {
                whereConditions.quiz_id = quiz_id;
            }

            console.log('🔍 Where conditions:', whereConditions);

            const submissions = await Submission.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Quiz,
                        as: 'quiz',
                        attributes: ['id', 'title', 'total_points', 'passing_score'],
                        include: [
                            {
                                model: Subject,
                                as: 'subject',
                                attributes: ['id', 'subject_name', 'subject_code']
                            }
                        ]
                    }
                ],
                limit: dbLimit,
                offset,
                order: [['created_at', 'DESC']]
            });


            const response = getPagingData(submissions, page, dbLimit);

            response.data = response.data.map(submission => {
                const data = submission.toJSON();
                data.time_spent_formatted = submission.getTimeSpentFormatted();
                data.grade = submission.getGrade();
                data.passed = submission.quiz.passing_score ? 
                    (submission.percentage || 0) >= submission.quiz.passing_score : null;
                return data;
            });


            res.status(200).json({
                success: true,
                message: 'My quiz attempts retrieved successfully',
                data: response
            });
        } catch (error) {
            console.error('❌ getMyAttempts error:', error);
            next(error);
        }
    },

    // GET /quizzes/:id/statistics 
    getQuizStatistics: async (req, res, next) => {
        try {
            const { id } = req.params;

            const quiz = await Quiz.findByPk(id, {
                include: [
                    {
                        model: Question,
                        as: 'questions',
                        attributes: ['id', 'question_text', 'question_type', 'points']
                    }
                ]
            });

            if (!quiz) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            const submissions = await Submission.findAll({
                where: { quiz_id: id, status: { [Op.in]: ['submitted', 'graded'] } },
                include: [
                    {
                        model: Response,
                        as: 'responses',
                        include: [
                            {
                                model: Question,
                                as: 'question',
                                attributes: ['id', 'question_type']
                            }
                        ]
                    }
                ]
            });

            const totalSubmissions = submissions.length;
            const averageScore = totalSubmissions > 0 ? 
                (submissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSubmissions).toFixed(2) : 0;
            const averagePercentage = totalSubmissions > 0 ?
                (submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / totalSubmissions).toFixed(1) : 0;
            const passRate = totalSubmissions > 0 && quiz.passing_score ?
                ((submissions.filter(s => (s.percentage || 0) >= quiz.passing_score).length / totalSubmissions) * 100).toFixed(1) : null;

            const questionStats = quiz.questions.map(question => {
                const responses = submissions.flatMap(s => 
                    s.responses.filter(r => r.question_id === question.id)
                );
                
                const totalResponses = responses.length;
                const correctResponses = responses.filter(r => r.is_correct === true).length;
                const correctPercentage = totalResponses > 0 ? 
                    ((correctResponses / totalResponses) * 100).toFixed(1) : 0;

                return {
                    question_id: question.id,
                    question_text: question.question_text.substring(0, 100) + '...',
                    question_type: question.question_type,
                    total_responses: totalResponses,
                    correct_responses: correctResponses,
                    correct_percentage: correctPercentage,
                    difficulty_level: correctPercentage > 80 ? 'Easy' : 
                                    correctPercentage > 60 ? 'Medium' : 'Hard'
                };
            });

            res.status(200).json({
                success: true,
                message: 'Quiz statistics retrieved successfully',
                data: {
                    quiz_info: {
                        id: quiz.id,
                        title: quiz.title,
                        total_questions: quiz.questions.length,
                        total_points: quiz.total_points
                    },
                    overall_statistics: {
                        total_submissions: totalSubmissions,
                        average_score: averageScore,
                        average_percentage: averagePercentage,
                        pass_rate: passRate,
                        completion_rate: '100%' 
                    },
                    question_statistics: questionStats
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /students/:id/quiz-history 
    getStudentQuizHistory: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { page = 1, size = 10 } = req.query;
            const { limit, offset } = getOffsetLimit(page, size);

            const student = await Student.findByPk(id);
            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const submissions = await Submission.findAndCountAll({
                where: { student_id: id },
                include: [
                    {
                        model: Quiz,
                        as: 'quiz',
                        attributes: ['id', 'title', 'total_points', 'passing_score'],
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
                order: [['created_at', 'DESC']]
            });

            const response = getPagingData(submissions, page, limit);

            response.data = response.data.map(submission => {
                const data = submission.toJSON();
                data.time_spent_formatted = submission.getTimeSpentFormatted();
                data.grade = submission.getGrade();
                data.passed = submission.quiz.passing_score ? 
                    (submission.percentage || 0) >= submission.quiz.passing_score : null;
                return data;
            });

            const allSubmissions = await Submission.findAll({
                where: { student_id: id, status: { [Op.in]: ['submitted', 'graded'] } }
            });

            const studentStats = {
                total_quizzes_taken: allSubmissions.length,
                average_score: allSubmissions.length > 0 ? 
                    (allSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / allSubmissions.length).toFixed(1) : 0,
                quizzes_passed: allSubmissions.filter(s => {
                        return (s.percentage || 0) >= 60;
                }).length
            };

            res.status(200).json({
                success: true,
                message: 'Student quiz history retrieved successfully',
                data: response,
                student_statistics: studentStats,
                student: {
                    id: student.id,
                    student_id: student.student_id,
                    name: `${student.first_name} ${student.last_name}`
                }
            });
        } catch (error) {
            next(error);
        }
    },
    importQuestionsCsv: async (req, res, next) => {
        try {
            console.log('🔵 Import CSV started');
            console.log('📁 File info:', req.file ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                fieldname: req.file.fieldname
            } : 'No file');
            
            const { id } = req.params;
            const quizId = parseInt(id, 10); // Ensure numeric ID to avoid type issues
            console.log('🆔 Quiz ID:', quizId);
            
            if (!req.file) {
                console.log('❌ No file uploaded');
                return res.status(400).json({ success: false, message: 'No file uploaded' });
            }

            console.log('📄 Parsing CSV...');
            console.log('📄 Raw buffer length:', req.file.buffer.length);
            console.log('📄 Raw buffer sample:', req.file.buffer.toString('utf8').substring(0, 200));
            
            const { parse } = require('csv-parse/sync');
            
            let records;
            try {
                // Try parsing with different options
                records = parse(req.file.buffer, { 
                    columns: true, 
                    skip_empty_lines: true, 
                    trim: true,
                    delimiter: ',',
                    quote: '"',
                    encoding: 'utf8'
                });
            } catch (parseError) {
                console.log('❌ CSV parse error:', parseError);
                // Try with different encoding or delimiter
                try {
                    const csvText = req.file.buffer.toString('utf8');
                    console.log('📄 CSV text sample:', csvText.substring(0, 300));
                    records = parse(csvText, { 
                        columns: true, 
                        skip_empty_lines: true, 
                        trim: true,
                        delimiter: ',',
                        quote: '"'
                    });
                } catch (secondError) {
                    console.log('❌ Second parse attempt failed:', secondError);
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Could not parse CSV file: ' + parseError.message 
                    });
                }
            }
            
            console.log('📊 Records parsed:', records.length);
            console.log('📋 First record:', records[0]);
            console.log('📋 All records:', records);

            const requiredCols = ['question_text','answer_A','answer_B','answer_C','answer_D','correct_letter'];
            let imported = 0, errors = [];

            // Cache current max order once to minimise DB hits
            console.log('🔍 Getting current max order...');
            let currentOrder = await Question.max('order_index',{where:{quiz_id:quizId}}) || 0;
            console.log('📊 Current max order:', currentOrder);
            let totalAddedPoints = 0;

            for(let i=0;i<records.length;i++){
                console.log(`\n🔄 Processing record ${i+1}/${records.length}`);
                const r = records[i];
                console.log('📝 Record data:', r);
                
                const missing = requiredCols.filter(k=>!r[k] || r[k].trim()==='');
                if(missing.length){ 
                    console.log('❌ Missing columns:', missing);
                    errors.push({row:i+2,msg:`Thiếu cột ${missing.join(',')}`}); 
                    continue; 
                }

                const question_text = r.question_text;
                const aA = r.answer_A, aB=r.answer_B, aC=r.answer_C, aD=r.answer_D;
                const correct = r.correct_letter;
                const points = r.points;
                const correctUpper = correct.trim().toUpperCase();
                
                console.log('📋 Question:', question_text.substring(0, 50) + '...');
                console.log('🎯 Correct answer:', correctUpper);
                
                if(!['A','B','C','D'].includes(correctUpper)){
                    console.log('❌ Invalid correct letter:', correctUpper);
                    errors.push({row:i+2,msg:'correct_letter invalid'});
                    continue;
                }
                
                // create question
                currentOrder += 1;
                const pointsNum = points?parseInt(points):1;
                
                console.log('💾 Creating question...');
                const q = await Question.create({
                    quiz_id:quizId,
                    question_text:question_text.replace(/"/g,''),
                    question_type:'multiple_choice',
                    points: pointsNum,
                    order_index:currentOrder
                });
                console.log('✅ Question created with ID:', q.id);
                
                const answers=[aA,aB,aC,aD];
                console.log('💾 Creating answers...');
                await Promise.all(answers.map((ans,idx)=>Answer.create({
                    question_id:q.id,
                    answer_text:ans.replace(/"/g,''),
                    is_correct: idx===('ABCD'.indexOf(correctUpper)),
                    order_index: idx+1
                })));
                console.log('✅ Answers created');
                
                imported++;
                totalAddedPoints += pointsNum;
            }

            console.log(`\n📊 Import summary: ${imported} questions imported, ${errors.length} errors`);

            // Update quiz total points after import
            if(imported > 0){
                console.log('🔄 Updating quiz total points...');
                const totalPoints = await Question.sum('points', { where: { quiz_id: quizId } });
                console.log('💯 New total points:', totalPoints);
                await Quiz.update({ total_points: totalPoints || 0 }, { where: { id: quizId } });
                console.log('✅ Quiz total points updated');
            }

            console.log('🎉 Import completed successfully');
            res.status(200).json({success:true,data:{imported,errors}});
        }catch(e){
            console.error('❌ Import error:', e);
            next(e);
        } 
    }
};

module.exports = quizController; 

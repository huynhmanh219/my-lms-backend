
const { Student, Lecturer, Subject, CourseSection, Lecture, LearningMaterial, Quiz, Submission, Account, StudentCourseSection, Question, Response } = require('../models');
const { getPagination, getPagingData } = require('../services/paginationService');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

const statisticsController = {
    // GET /statistics/dashboard 
    getDashboardStats: async (req, res, next) => {
        try {
            const { timeframe = '30', detailed = false } = req.query;
            const daysBack = parseInt(timeframe);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysBack);

            const [
                totalStudents,
                totalLecturers,
                totalCourses,
                totalQuizzes,
                activeEnrollments,
                totalSubmissions,
                totalMaterials,
                totalLectures
            ] = await Promise.all([
                Student.count(),
                Lecturer.count(),
                Subject.count(),
                Quiz.count(),
                StudentCourseSection.count(),
                Submission.count({ where: { created_at: { [Op.gte]: startDate } } }),
                LearningMaterial.count(),
                Lecture.count()
            ]);

            const recentDate = new Date();
            recentDate.setDate(recentDate.getDate() - 7);

            const [
                newStudents,
                newQuizzes,
                newMaterials,
                completedQuizzes
            ] = await Promise.all([
                Student.count({ where: { created_at: { [Op.gte]: recentDate } } }),
                Quiz.count({ where: { created_at: { [Op.gte]: recentDate } } }),
                LearningMaterial.count({ where: { created_at: { [Op.gte]: recentDate } } }),
                Submission.count({ 
                    where: { 
                        status: { [Op.in]: ['submitted', 'graded'] },
                        submitted_at: { [Op.gte]: recentDate }
                    }
                })
            ]);

            let detailedStats = {};
            
            if (detailed === 'true') {
                const enrollmentTrend = await StudentCourseSection.findAll({
                    attributes: [
                        [Sequelize.fn('DATE', Sequelize.col('created_at')), 'date'],
                        [Sequelize.fn('COUNT', '*'), 'count']
                    ],
                    where: { created_at: { [Op.gte]: startDate } },
                    group: [Sequelize.fn('DATE', Sequelize.col('created_at'))],
                    order: [[Sequelize.fn('DATE', Sequelize.col('created_at')), 'ASC']],
                    raw: true
                });

                detailedStats = {
                    enrollment_trend: enrollmentTrend
                };
            }

            const dashboardData = {
                overview: {
                    total_students: totalStudents,
                    total_lecturers: totalLecturers,
                    total_courses: totalCourses,
                    total_quizzes: totalQuizzes,
                    active_enrollments: activeEnrollments,
                    total_materials: totalMaterials,
                    total_lectures: totalLectures
                },
                recent_activity: {
                    timeframe: `${daysBack} days`,
                    new_students: newStudents,
                    new_quizzes: newQuizzes,
                    new_materials: newMaterials,
                    completed_quizzes: completedQuizzes,
                    quiz_submissions: totalSubmissions
                },
                engagement: {
                    avg_students_per_course: activeEnrollments > 0 ? (activeEnrollments / totalCourses).toFixed(1) : 0,
                    avg_quizzes_per_course: totalCourses > 0 ? (totalQuizzes / totalCourses).toFixed(1) : 0,
                    avg_materials_per_course: totalCourses > 0 ? (totalMaterials / totalCourses).toFixed(1) : 0
                },
                ...detailedStats
            };

            res.status(200).json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: dashboardData,
                generated_at: new Date()
            });
        } catch (error) {
            next(error);
        }
    },
    // GET /statistics/students 
    getStudentStats: async (req, res, next) => {
        try {
            const { page = 1, size = 10, course_id, timeframe = '30' } = req.query;
            const { limit, offset } = getPagination(page, size);

            const students = await Student.findAndCountAll({
                include: [
                    {
                        model: Account,
                        as: 'account',
                        attributes: ['email', 'created_at', 'last_login']
                    },
                    {
                        model: StudentCourseSection,
                        as: 'enrollments',
                        include: [{
                            model: CourseSection,
                            as: 'courseSection',
                            attributes: ['section_name'],
                            include: [{
                                model: Subject,
                                as: 'subject',
                                attributes: ['name', 'code']
                            }]
                        }]
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });

            const response = getPagingData(students, page, limit);

            const totalStudents = await Student.count();
            const activeEnrollments = await StudentCourseSection.count();

            res.status(200).json({
                success: true,
                message: 'Student statistics retrieved successfully',
                data: response,
                summary: {
                    total_students: totalStudents,
                    total_enrollments: activeEnrollments,
                    average_enrollments_per_student: totalStudents > 0 ? (activeEnrollments / totalStudents).toFixed(1) : 0
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /statistics/teachers 
    getTeacherStats: async (req, res, next) => {
        try {
            const { page = 1, size = 10 } = req.query;
            const { limit, offset } = getPagination(page, size);

            const lecturers = await Lecturer.findAndCountAll({
                include: [
                    {
                        model: Account,
                        as: 'account',
                        attributes: ['email', 'created_at', 'last_login']
                    },
                    {
                        model: Subject,
                        as: 'subjects',
                        attributes: ['id', 'name', 'code', 'credits']
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });

            const response = getPagingData(lecturers, page, limit);

            const totalLecturers = await Lecturer.count();
            const totalSubjects = await Subject.count();

            res.status(200).json({
                success: true,
                message: 'Teacher statistics retrieved successfully',
                data: response,
                summary: {
                    total_lecturers: totalLecturers,
                    total_subjects: totalSubjects,
                    average_subjects_per_lecturer: totalLecturers > 0 ? (totalSubjects / totalLecturers).toFixed(1) : 0
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /statistics/courses 
    getCourseStats: async (req, res, next) => {
        try {
            const { page = 1, size = 10, lecturer_id } = req.query;
            const { limit, offset } = getPagination(page, size);

            const whereConditions = {};
            if (lecturer_id) {
                whereConditions.lecturer_id = lecturer_id;
            }

            const courses = await Subject.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Lecturer,
                        as: 'lecturer',
                        attributes: ['id', 'first_name', 'last_name', 'email']
                    },
                    {
                        model: CourseSection,
                        as: 'courseSections',
                        include: [{
                            model: StudentCourseSection,
                            as: 'enrollments',
                            attributes: ['id']
                        }]
                    },
                    {
                        model: Quiz,
                        as: 'quizzes',
                        attributes: ['id', 'title', 'status']
                    },
                    {
                        model: LearningMaterial,
                        as: 'materials',
                        attributes: ['id', 'title', 'type']
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });

            const response = getPagingData(courses, page, limit);

            response.items = response.items.map(course => {
                const courseData = course.toJSON();
                const totalSections = courseData.courseSections.length;
                const totalStudents = courseData.courseSections.reduce((sum, section) => 
                    sum + section.enrollments.length, 0);

                return {
                    ...courseData,
                    analytics: {
                        total_sections: totalSections,
                        total_students: totalStudents,
                        total_quizzes: courseData.quizzes.length,
                        total_materials: courseData.materials.length
                    }
                };
            });

            const [totalCourses, totalEnrollments] = await Promise.all([
                Subject.count(),
                StudentCourseSection.count()
            ]);

            res.status(200).json({
                success: true,
                message: 'Course statistics retrieved successfully',
                data: response,
                summary: {
                    total_courses: totalCourses,
                    total_enrollments: totalEnrollments,
                    average_enrollments_per_course: totalCourses > 0 ? (totalEnrollments / totalCourses).toFixed(1) : 0
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /statistics/classes 
    getClassStats: async (req, res, next) => {
        try {
            const { page = 1, size = 10, subject_id } = req.query;
            const { limit, offset } = getPagination(page, size);

            const whereConditions = {};
            if (subject_id) {
                whereConditions.subject_id = subject_id;
            }

            const classes = await CourseSection.findAndCountAll({
                where: whereConditions,
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'name', 'code', 'credits'],
                        include: [{
                            model: Lecturer,
                            as: 'lecturer',
                            attributes: ['id', 'first_name', 'last_name']
                        }]
                    },
                    {
                        model: StudentCourseSection,
                        as: 'enrollments',
                        include: [{
                            model: Student,
                            as: 'student',
                            attributes: ['id', 'first_name', 'last_name']
                        }]
                    }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']]
            });

            const response = getPagingData(classes, page, limit);

            response.items = response.items.map(classSection => {
                const classData = classSection.toJSON();
                return {
                    ...classData,
                    performance: {
                        total_students: classData.enrollments.length,
                        capacity_utilization: '85%' // This would be calculated based on max capacity
                    }
                };
            });

            const totalClasses = await CourseSection.count();
            const totalClassEnrollments = await StudentCourseSection.count();

            res.status(200).json({
                success: true,
                message: 'Class statistics retrieved successfully',
                data: response,
                summary: {
                    total_classes: totalClasses,
                    total_enrollments: totalClassEnrollments,
                    average_class_size: totalClasses > 0 ? (totalClassEnrollments / totalClasses).toFixed(1) : 0
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /reports/student-progress 
    getStudentProgress: async (req, res, next) => {
        try {
            const { student_id } = req.query;

            if (!student_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Student ID is required'
                });
            }

            const student = await Student.findByPk(student_id, {
                include: [
                    {
                        model: Account,
                        as: 'account',
                        attributes: ['email', 'created_at', 'last_login']
                    },
                    {
                        model: StudentCourseSection,
                        as: 'enrollments',
                        include: [{
                            model: CourseSection,
                            as: 'courseSection',
                            attributes: ['id', 'section_name'],
                            include: [{
                                model: Subject,
                                as: 'subject',
                                attributes: ['id', 'name', 'code', 'credits']
                            }]
                        }]
                    },
                    {
                        model: Submission,
                        as: 'submissions',
                        attributes: ['id', 'quiz_id', 'status', 'score', 'percentage', 'created_at'],
                        include: [{
                            model: Quiz,
                            as: 'quiz',
                            attributes: ['id', 'title', 'total_points', 'subject_id']
                        }]
                    }
                ]
            });

            if (!student) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found'
                });
            }

            const enrolledCourses = student.enrollments.map(enrollment => {
                const course = enrollment.courseSection.subject;
                const courseSubmissions = student.submissions.filter(sub => 
                    sub.quiz && sub.quiz.subject_id === course.id
                );
                const completedSubmissions = courseSubmissions.filter(s => 
                    s.status === 'submitted' || s.status === 'graded'
                );

                const averageScore = completedSubmissions.length > 0
                    ? (completedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / completedSubmissions.length).toFixed(1)
                    : 0;

                return {
                    course_id: course.id,
                    course_name: course.name,
                    course_code: course.code,
                    section_name: enrollment.courseSection.section_name,
                    quiz_attempts: courseSubmissions.length,
                    completed_quizzes: completedSubmissions.length,
                    average_score: averageScore,
                    last_activity: courseSubmissions.length > 0 
                        ? courseSubmissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0].created_at
                        : null
                };
            });

            const overallStats = {
                total_courses: enrolledCourses.length,
                total_quiz_attempts: student.submissions.length,
                completed_quizzes: student.submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length,
                overall_average: student.submissions.length > 0
                    ? (student.submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / student.submissions.length).toFixed(1)
                    : 0
            };

            res.status(200).json({
                success: true,
                message: 'Student progress report retrieved successfully',
                data: {
                    student_info: {
                        id: student.id,
                        student_id: student.student_id,
                        name: `${student.first_name} ${student.last_name}`,
                        email: student.account.email
                    },
                    progress_summary: overallStats,
                    course_progress: enrolledCourses,
                    generated_at: new Date()
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /reports/class-performance 
    getClassPerformance: async (req, res, next) => {
        try {
            const { class_id } = req.query;

            if (!class_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Class ID is required'
                });
            }

            const classSection = await CourseSection.findByPk(class_id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'name', 'code'],
                        include: [{
                            model: Quiz,
                            as: 'quizzes',
                            attributes: ['id', 'title', 'total_points'],
                            include: [{
                                model: Submission,
                                as: 'submissions',
                                attributes: ['id', 'student_id', 'status', 'percentage']
                            }]
                        }]
                    },
                    {
                        model: StudentCourseSection,
                        as: 'enrollments',
                        include: [{
                            model: Student,
                            as: 'student',
                            attributes: ['id', 'student_id', 'first_name', 'last_name']
                        }]
                    }
                ]
            });

            if (!classSection) {
                return res.status(404).json({
                    success: false,
                    message: 'Class not found'
                });
            }

            const students = classSection.enrollments.map(e => e.student);
            const quizzes = classSection.subject.quizzes || [];

            const studentPerformance = students.map(student => {
                const studentSubmissions = quizzes.flatMap(quiz => 
                    quiz.submissions.filter(sub => sub.student_id === student.id)
                );
                const completedSubmissions = studentSubmissions.filter(s => 
                    s.status === 'submitted' || s.status === 'graded'
                );

                const averageScore = completedSubmissions.length > 0
                    ? (completedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / completedSubmissions.length).toFixed(1)
                    : 0;

                return {
                    student_id: student.id,
                    name: `${student.first_name} ${student.last_name}`,
                    completed_quizzes: completedSubmissions.length,
                    average_score: averageScore
                };
            });

            const classAverage = studentPerformance.length > 0
                ? (studentPerformance.reduce((sum, s) => sum + parseFloat(s.average_score || 0), 0) / studentPerformance.length).toFixed(1)
                : 0;

            res.status(200).json({
                success: true,
                message: 'Class performance report retrieved successfully',
                data: {
                    class_info: {
                        class_id: classSection.id,
                        section_name: classSection.section_name,
                        subject: classSection.subject
                    },
                    performance_summary: {
                        total_students: students.length,
                        total_quizzes: quizzes.length,
                        class_average: classAverage
                    },
                    student_performance: studentPerformance,
                    generated_at: new Date()
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /reports/quiz-analytics 
    getQuizAnalytics: async (req, res, next) => {
        try {
            const { quiz_id } = req.query;

            if (!quiz_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Quiz ID is required'
                });
            }

            const quiz = await Quiz.findByPk(quiz_id, {
                include: [
                    {
                        model: Subject,
                        as: 'subject',
                        attributes: ['id', 'name', 'code']
                    },
                    {
                        model: Submission,
                        as: 'submissions',
                        attributes: ['id', 'student_id', 'status', 'score', 'percentage', 'time_spent'],
                        include: [{
                            model: Student,
                            as: 'student',
                            attributes: ['id', 'student_id', 'first_name', 'last_name']
                        }]
                    },
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

            const submissions = quiz.submissions || [];
            const completedSubmissions = submissions.filter(s => s.status === 'submitted' || s.status === 'graded');

            const analytics = {
                total_attempts: submissions.length,
                completed_attempts: completedSubmissions.length,
                average_score: completedSubmissions.length > 0
                    ? (completedSubmissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / completedSubmissions.length).toFixed(1)
                    : 0,
                pass_rate: completedSubmissions.length > 0
                    ? ((completedSubmissions.filter(s => (s.percentage || 0) >= 70).length / completedSubmissions.length) * 100).toFixed(1)
                    : 0,
                score_distribution: {
                    'A (90-100%)': completedSubmissions.filter(s => s.percentage >= 90).length,
                    'B (80-89%)': completedSubmissions.filter(s => s.percentage >= 80 && s.percentage < 90).length,
                    'C (70-79%)': completedSubmissions.filter(s => s.percentage >= 70 && s.percentage < 80).length,
                    'D (60-69%)': completedSubmissions.filter(s => s.percentage >= 60 && s.percentage < 70).length,
                    'F (0-59%)': completedSubmissions.filter(s => s.percentage < 60).length
                }
            };

            res.status(200).json({
                success: true,
                message: 'Quiz analytics retrieved successfully',
                data: {
                    quiz_info: {
                        id: quiz.id,
                        title: quiz.title,
                        total_points: quiz.total_points,
                        total_questions: quiz.questions.length,
                        subject: quiz.subject
                    },
                    analytics: analytics,
                    submissions: completedSubmissions.map(sub => ({
                        student: {
                            id: sub.student.id,
                            name: `${sub.student.first_name} ${sub.student.last_name}`
                        },
                        score: sub.score,
                        percentage: sub.percentage
                    })),
                    generated_at: new Date()
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /reports/attendance 
    getAttendanceReport: async (req, res, next) => {
        try {
            const { class_id, timeframe = '30' } = req.query;
            const daysBack = parseInt(timeframe);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - daysBack);

            let whereConditions = {};
            if (class_id) {
                whereConditions.course_section_id = class_id;
            }

            const students = await Student.findAll({
                include: [
                    {
                        model: StudentCourseSection,
                        as: 'enrollments',
                        where: whereConditions,
                        required: class_id ? true : false,
                        include: [{
                            model: CourseSection,
                            as: 'courseSection',
                            attributes: ['section_name'],
                            include: [{
                                model: Subject,
                                as: 'subject',
                                attributes: ['name', 'code']
                            }]
                        }]
                    },
                    {
                        model: Submission,
                        as: 'submissions',
                        attributes: ['created_at'],
                        where: { created_at: { [Op.gte]: startDate } },
                        required: false
                    }
                ]
            });

            const attendanceData = students.map(student => {
                const activityDates = student.submissions.map(sub => 
                    new Date(sub.created_at).toDateString()
                );
                const uniqueActivityDays = [...new Set(activityDates)].length;
                const estimatedAttendance = Math.min((uniqueActivityDays / daysBack) * 100, 100).toFixed(1);

                return {
                    student_id: student.id,
                    name: `${student.first_name} ${student.last_name}`,
                    activity_days: uniqueActivityDays,
                    estimated_attendance_rate: estimatedAttendance,
                    engagement_level: estimatedAttendance > 70 ? 'High' : 
                                    estimatedAttendance > 40 ? 'Medium' : 'Low'
                };
            });

            const summary = {
                total_students: attendanceData.length,
                average_attendance: attendanceData.length > 0
                    ? (attendanceData.reduce((sum, s) => sum + parseFloat(s.estimated_attendance_rate), 0) / attendanceData.length).toFixed(1)
                    : 0,
                high_engagement: attendanceData.filter(s => s.engagement_level === 'High').length,
                medium_engagement: attendanceData.filter(s => s.engagement_level === 'Medium').length,
                low_engagement: attendanceData.filter(s => s.engagement_level === 'Low').length
            };

            res.status(200).json({
                success: true,
                message: 'Attendance report retrieved successfully',
                data: {
                    summary: summary,
                    student_attendance: attendanceData,
                    report_period: `${daysBack} days`,
                    note: 'Attendance estimated based on learning platform activity',
                    generated_at: new Date()
                }
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /reports/grades 
    getGradesReport: async (req, res, next) => {
        try {
            const { class_id, student_id, subject_id, format = 'summary' } = req.query;

            let submissionWhere = {
                status: { [Op.in]: ['submitted', 'graded'] }
            };
            
            if (student_id) submissionWhere.student_id = student_id;

            const submissions = await Submission.findAll({
                where: submissionWhere,
                include: [
                    {
                        model: Student,
                        as: 'student',
                        attributes: ['id', 'student_id', 'first_name', 'last_name']
                    },
                    {
                        model: Quiz,
                        as: 'quiz',
                        attributes: ['id', 'title', 'total_points', 'subject_id'],
                        include: [{
                            model: Subject,
                            as: 'subject',
                            attributes: ['id', 'name', 'code'],
                            where: subject_id ? { id: subject_id } : {},
                            required: subject_id ? true : false
                        }]
                    }
                ],
                order: [['submitted_at', 'DESC']]
            });

            const studentGrades = {};
            submissions.forEach(submission => {
                const studentId = submission.student.id;
                if (!studentGrades[studentId]) {
                    studentGrades[studentId] = {
                        student_info: {
                            id: submission.student.id,
                            student_id: submission.student.student_id,
                            name: `${submission.student.first_name} ${submission.student.last_name}`
                        },
                        grades: [],
                        statistics: {}
                    };
                }
                
                studentGrades[studentId].grades.push({
                    quiz_id: submission.quiz.id,
                    quiz_title: submission.quiz.title,
                    subject: submission.quiz.subject.name,
                    score: submission.score,
                    percentage: submission.percentage,
                    grade_letter: getGradeLetter(submission.percentage)
                });
            });

            Object.keys(studentGrades).forEach(studentId => {
                const grades = studentGrades[studentId].grades;
                const percentages = grades.map(g => g.percentage || 0);
                
                studentGrades[studentId].statistics = {
                    total_quizzes: grades.length,
                    average_score: percentages.length > 0 
                        ? (percentages.reduce((sum, p) => sum + p, 0) / percentages.length).toFixed(1)
                        : 0,
                    highest_score: percentages.length > 0 ? Math.max(...percentages) : 0,
                    lowest_score: percentages.length > 0 ? Math.min(...percentages) : 0,
                    grade_letter: getGradeLetter(
                        percentages.length > 0 
                            ? percentages.reduce((sum, p) => sum + p, 0) / percentages.length
                            : 0
                    )
                };
            });

            const overallStats = {
                total_submissions: submissions.length,
                total_students: Object.keys(studentGrades).length,
                overall_average: submissions.length > 0 
                    ? (submissions.reduce((sum, s) => sum + (s.percentage || 0), 0) / submissions.length).toFixed(1)
                    : 0
            };

            res.status(200).json({
                success: true,
                message: 'Grades report retrieved successfully',
                data: {
                    overall_statistics: overallStats,
                    student_grades: format === 'detailed' ? studentGrades : 
                                  Object.keys(studentGrades).map(studentId => ({
                                      ...studentGrades[studentId].student_info,
                                      ...studentGrades[studentId].statistics
                                  })),
                    generated_at: new Date()
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

// Helper function for grade letters
function getGradeLetter(percentage) {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
}

module.exports = statisticsController; 
const { Lecture, LectureProgress, CourseSection, CourseSectionProgress, Student, Chapter } = require('../models');
const { Op } = require('sequelize');

const recalcSectionProgress = async (studentId, sectionId) => {
    const section = await CourseSection.findByPk(sectionId);
    if (!section) return;

    const chapters = await Chapter.findAll({ where: { subject_id: section.subject_id }, attributes: ['id'] });
    const chapterIds = chapters.map(ch => ch.id);

    const totalLectures = await Lecture.count({ where: { chapter_id: { [Op.in]: chapterIds }, is_published: true } });

    const completedCount = await LectureProgress.count({
        where: { student_id: studentId, status: 'completed' },
        include: [{ model: Lecture, as: 'lecture', where: { chapter_id: { [Op.in]: chapterIds }, is_published: true } }]
    });

    const completionRate = totalLectures === 0 ? 0 : ((completedCount / totalLectures) * 100).toFixed(2);

    const [sectionProg] = await CourseSectionProgress.findOrCreate({
        where: { student_id: studentId, course_section_id: sectionId },
        defaults: {
            total_lectures: totalLectures,
            lectures_completed: completedCount,
            completion_rate: completionRate,
            updated_at: new Date()
        }
    });

    await sectionProg.update({
        total_lectures: totalLectures,
        lectures_completed: completedCount,
        completion_rate: completionRate,
        updated_at: new Date()
    });
};

const MIN_READ_TIME_SEC = 10;

const calcProgressPercent = (timeSpent, scrolled) => {
    const timePart = Math.min(timeSpent / MIN_READ_TIME_SEC, 1) * 50;
    const scrollPart = scrolled ? 50 : 0;
    return Math.round(timePart + scrollPart);
};

const progressController = {
    startLecture: async (req, res, next) => {
        try {
            const { id } = req.params;
            const accountId = req.user.id;
            const student = await Student.findOne({ where: { account_id: accountId } });
            if (!student) return res.status(403).json({ success: false, message: 'Only students can start progress' });

            const [progress] = await LectureProgress.findOrCreate({
                where: { student_id: student.id, lecture_id: id },
                defaults: {
                    status: 'in_progress',
                    first_viewed_at: new Date(),
                    last_viewed_at: new Date()
                }
            });

            if (progress && !progress.first_viewed_at) {
                await progress.update({ first_viewed_at: new Date(), last_viewed_at: new Date() });
            }

            return res.status(200).json({ success: true, data: progress });
        } catch (error) { next(errFor); }
    },

    updateLecture: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { time_delta = 0, scrolled_to_bottom = false } = req.body;
            const accountId = req.user.id;
            
            console.log('🔄 Update lecture progress:', {
                lectureId: id,
                time_delta,
                scrolled_to_bottom,
                userId: accountId
            });
            
            const student = await Student.findOne({ where: { account_id: accountId } });
            if (!student) return res.status(403).json({ success: false, message: 'Only students can update progress' });

            const [progress] = await LectureProgress.findOrCreate({
                where: { student_id: student.id, lecture_id: id },
                defaults: {
                    status: 'in_progress',
                    first_viewed_at: new Date(),
                    last_viewed_at: new Date()
                }
            });

            const currentTimeSpent = progress.time_spent_sec + parseInt(time_delta, 10);
            const updates = {
                time_spent_sec: currentTimeSpent,
                last_viewed_at: new Date()
            };
            if (scrolled_to_bottom) updates.scrolled_to_bottom = true;

            console.log('📊 Current progress state:', {
                currentTimeSpent,
                scrolled_to_bottom: progress.scrolled_to_bottom || scrolled_to_bottom,
                currentStatus: progress.status,
                MIN_READ_TIME_SEC
            });

            let newStatus = progress.status;
            let justCompleted = false;
            
            const hasEnoughTime = currentTimeSpent >= MIN_READ_TIME_SEC;
            const hasScrolledToBottom = progress.scrolled_to_bottom || scrolled_to_bottom;
            
            console.log('🎯 Completion check:', {
                hasEnoughTime,
                hasScrolledToBottom,
                canComplete: hasEnoughTime && hasScrolledToBottom,
                currentStatus: progress.status
            });
            
            if (progress.status !== 'completed' && hasEnoughTime && hasScrolledToBottom) {
                newStatus = 'completed';
                updates.status = 'completed';
                updates.completed_at = new Date();
                justCompleted = true;
            }

            await progress.update(updates);

            if (justCompleted) {
                const lecture = await Lecture.findByPk(id);
                if (lecture) {
                    const chapters = await lecture.getChapter();
                    const subjectId = chapters ? chapters.subject_id : null;
                    if (subjectId) {
                        const section = await CourseSection.findOne({ where: { subject_id: subjectId } });
                        if (section) await recalcSectionProgress(student.id, section.id);
                    }
                }
            }

            const finalProgress = await LectureProgress.findByPk(progress.id);

            const progressPercent = calcProgressPercent(finalProgress.time_spent_sec, finalProgress.scrolled_to_bottom);
            const responseData = { ...finalProgress.toJSON(), progress_percent: progressPercent };

            return res.status(200).json({ success: true, data: responseData });
        } catch (error) { 
            next(error); 
        }
    },

    getLectureProgress: async (req, res, next) => {
        try {
            const { id } = req.params;
            const accountId = req.user.id;
            const student = await Student.findOne({ where: { account_id: accountId } });
            if (!student) return res.status(403).json({ success: false, message: 'Only students can view progress' });

            const progress = await LectureProgress.findOne({ 
                where: { student_id: student.id, lecture_id: id } 
            });
            
            if (!progress) {
                return res.status(200).json({ 
                    success: true, 
                    data: { 
                        status: 'not_started',
                        time_spent_sec: 0,
                        scrolled_to_bottom: false,
                        progress_percent: 0
                    } 
                });
            }

            const progressPercent = calcProgressPercent(progress.time_spent_sec, progress.scrolled_to_bottom);
            return res.status(200).json({ success: true, data: { ...progress.toJSON(), progress_percent: progressPercent } });
        } catch (error) { next(error); }
    },

    getSectionProgressForStudent: async (req, res, next) => {
        try {
            const { id } = req.params;
            const accountId = req.user.id;
            const student = await Student.findOne({ where: { account_id: accountId } });
            if (!student) return res.status(403).json({ success: false, message: 'Only students can view progress' });

            const section = await CourseSection.findByPk(id);
            if (!section) return res.status(404).json({ success: false, message: 'Section not found' });
            const subjectId = section.subject_id;

            const chapters = await Chapter.findAll({ where: { subject_id: subjectId }, attributes: ['id'] });
            const chapterIds = chapters.map(ch => ch.id);
                
            const totalLectures = await Lecture.count({ where: { chapter_id: { [Op.in]: chapterIds }, is_published: true } });

            const completedCount = await LectureProgress.count({ where: { student_id: student.id, status: 'completed' }, include: [{ model: Lecture, as: 'lecture', where: { chapter_id: { [Op.in]: chapterIds }, is_published: true } }] });

            const completionRate = totalLectures === 0 ? 0 : ((completedCount / totalLectures) * 100).toFixed(2);

            return res.status(200).json({
                success: true,
                data: {
                    total_lectures: totalLectures,
                    lectures_completed: completedCount,
                    completion_rate: completionRate
                }
            });
        } catch (error) { next(error); }
    }
};

module.exports = progressController; 
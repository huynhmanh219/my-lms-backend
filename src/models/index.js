

const sequelize = require('../config/database');

// Import all models
const Role = require('./Role');
const Account = require('./Account');
const Student = require('./Student');
const Lecturer = require('./Lecturer');
const Subject = require('./Subject');
const CourseSection = require('./CourseSection');
const StudentCourseSection = require('./StudentCourseSection');
const Chapter = require('./Chapter');
const Lecture = require('./Lecture');
const LearningMaterial = require('./LearningMaterial');
// Quiz models - Phase 8
const Quiz = require('./Quiz');
const Question = require('./Question');
const Answer = require('./Answer');
const Submission = require('./Submission');
const Response = require('./Response');
// Rating models
const LectureRating = require('./LectureRating');
const ClassRating = require('./ClassRating');
const LectureProgress = require('./LectureProgress');
const CourseSectionProgress = require('./CourseSectionProgress');

// Define model associations
const defineAssociations = () => {
    // Role - Account associations
    Role.hasMany(Account, { foreignKey: 'role_id', as: 'accounts' });
    Account.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

    // Account - Student/Lecturer associations
    Account.hasOne(Student, { foreignKey: 'account_id', as: 'student' });
    Student.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });
    
    Account.hasOne(Lecturer, { foreignKey: 'account_id', as: 'lecturer' });
    Lecturer.belongsTo(Account, { foreignKey: 'account_id', as: 'account' });

    // Subject - Lecturer associations
    Subject.belongsTo(Lecturer, { foreignKey: 'lecturer_id', as: 'lecturer' });
    Lecturer.hasMany(Subject, { foreignKey: 'lecturer_id', as: 'subjects' });

    // Subject - CourseSection associations
    Subject.hasMany(CourseSection, { foreignKey: 'subject_id', as: 'courseSections' });
    CourseSection.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

    // CourseSection - Lecturer associations
    CourseSection.belongsTo(Lecturer, { foreignKey: 'lecturer_id', as: 'lecturer' });
    Lecturer.hasMany(CourseSection, { foreignKey: 'lecturer_id', as: 'courseSections' });

    // Student - CourseSection many-to-many through StudentCourseSection
    Student.belongsToMany(CourseSection, { 
        through: StudentCourseSection,
        foreignKey: 'student_id',
        otherKey: 'course_section_id',
        as: 'courseSections'
    });
    CourseSection.belongsToMany(Student, { 
        through: StudentCourseSection,
        foreignKey: 'course_section_id',
        otherKey: 'student_id',
        as: 'students'
    });

    
    StudentCourseSection.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
    StudentCourseSection.belongsTo(CourseSection, { foreignKey: 'course_section_id', as: 'courseSection' });
    Student.hasMany(StudentCourseSection, { foreignKey: 'student_id', as: 'enrollments' });
    CourseSection.hasMany(StudentCourseSection, { foreignKey: 'course_section_id', as: 'enrollments' });

  
    Subject.hasMany(Chapter, { foreignKey: 'subject_id', as: 'chapters' });
    Chapter.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

    // Chapter - Lecture associations
    Chapter.hasMany(Lecture, { foreignKey: 'chapter_id', as: 'lectures' });
    Lecture.belongsTo(Chapter, { foreignKey: 'chapter_id', as: 'chapter' });

    // LearningMaterial associations
    Chapter.hasMany(LearningMaterial, { foreignKey: 'chapter_id', as: 'materials' });
    LearningMaterial.belongsTo(Chapter, { foreignKey: 'chapter_id', as: 'chapter' });
    
    Subject.hasMany(LearningMaterial, { foreignKey: 'subject_id', as: 'materials' });
    LearningMaterial.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
    
    Lecturer.hasMany(LearningMaterial, { foreignKey: 'uploaded_by', as: 'uploadedMaterials' });
    LearningMaterial.belongsTo(Lecturer, { foreignKey: 'uploaded_by', as: 'uploader' });


    // Quiz associations
    Subject.hasMany(Quiz, { foreignKey: 'subject_id', as: 'quizzes' });
    Quiz.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
    
    CourseSection.hasMany(Quiz, { foreignKey: 'course_section_id', as: 'quizzes' });
    Quiz.belongsTo(CourseSection, { foreignKey: 'course_section_id', as: 'courseSection' });
    
    Lecturer.hasMany(Quiz, { foreignKey: 'lecturer_id', as: 'quizzes' });
    Quiz.belongsTo(Lecturer, { foreignKey: 'lecturer_id', as: 'lecturer' });


    Quiz.hasMany(Question, { foreignKey: 'quiz_id', as: 'questions', onDelete: 'CASCADE' });
    Question.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

    // Question - Answer associations
    Question.hasMany(Answer, { foreignKey: 'question_id', as: 'answers', onDelete: 'CASCADE' });
    Answer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

    // Quiz - Submission associations
    Quiz.hasMany(Submission, { foreignKey: 'quiz_id', as: 'submissions' });
    Submission.belongsTo(Quiz, { foreignKey: 'quiz_id', as: 'quiz' });

    // Student - Submission associations
    Student.hasMany(Submission, { foreignKey: 'student_id', as: 'submissions' });
    Submission.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

    // Lecturer - Submission associations (graded_by)
    Lecturer.hasMany(Submission, { foreignKey: 'graded_by', as: 'gradedSubmissions' });
    Submission.belongsTo(Lecturer, { foreignKey: 'graded_by', as: 'grader' });

    // Submission - Response associations
    Submission.hasMany(Response, { foreignKey: 'submission_id', as: 'responses', onDelete: 'CASCADE' });
    Response.belongsTo(Submission, { foreignKey: 'submission_id', as: 'submission' });

    // Question - Response associations
    Question.hasMany(Response, { foreignKey: 'question_id', as: 'responses' });
    Response.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

    // Answer - Response associations
    Answer.hasMany(Response, { foreignKey: 'answer_id', as: 'responses' });
    Response.belongsTo(Answer, { foreignKey: 'answer_id', as: 'selectedAnswer' });

    // Lecturer - Response associations (graded_by)
    Lecturer.hasMany(Response, { foreignKey: 'graded_by', as: 'gradedResponses' });
    Response.belongsTo(Lecturer, { foreignKey: 'graded_by', as: 'grader' });

    // LectureRating associations
    Lecture.hasMany(LectureRating, { foreignKey: 'lecture_id', as: 'ratings' });
    LectureRating.belongsTo(Lecture, { foreignKey: 'lecture_id', as: 'lecture' });
    
    Student.hasMany(LectureRating, { foreignKey: 'student_id', as: 'lectureRatings' });
    LectureRating.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

    // ClassRating associations
    CourseSection.hasMany(ClassRating, { foreignKey: 'class_id', as: 'ratings' });
    ClassRating.belongsTo(CourseSection, { foreignKey: 'class_id', as: 'courseSection' });
    
    Student.hasMany(ClassRating, { foreignKey: 'student_id', as: 'classRatings' });
    ClassRating.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

    // Progress associations
    Student.hasMany(LectureProgress, { foreignKey: 'student_id', as: 'lectureProgresses' });
    LectureProgress.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

    Lecture.hasMany(LectureProgress, { foreignKey: 'lecture_id', as: 'progress' });
    LectureProgress.belongsTo(Lecture, { foreignKey: 'lecture_id', as: 'lecture' });

    Student.hasMany(CourseSectionProgress, { foreignKey: 'student_id', as: 'sectionProgresses' });
    CourseSectionProgress.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

    CourseSection.hasMany(CourseSectionProgress, { foreignKey: 'course_section_id', as: 'progresses' });
    CourseSectionProgress.belongsTo(CourseSection, { foreignKey: 'course_section_id', as: 'courseSection' });
};


defineAssociations();


module.exports = {
    sequelize,
    Role,
    Account,
    Student,
    Lecturer,
    Subject,
    CourseSection,
    StudentCourseSection,
    Chapter,
    Lecture,
    LearningMaterial,
    // Quiz models - Phase 8
    Quiz,
    Question,
    Answer,
    Submission,
    Response,
    // Rating models
    LectureRating,
    ClassRating,
    // Progress models
    LectureProgress,
    CourseSectionProgress
}; 
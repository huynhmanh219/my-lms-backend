
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentCourseSection = sequelize.define('StudentCourseSection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    course_section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'course_sections',
            key: 'id'
        }
    },
    enrollment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('enrolled', 'completed', 'dropped', 'failed'),
        defaultValue: 'enrolled'
    },
    final_grade: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 100
        }
    }
}, {
    tableName: 'student_course_sections',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['student_id', 'course_section_id'],
            name: 'unique_enrollment'
        },
        {
            fields: ['student_id']
        },
        {
            fields: ['course_section_id']
        },
        {
            fields: ['status']
        }
    ]
});

StudentCourseSection.prototype.isActive = function() {
    return this.status === 'enrolled';
};

StudentCourseSection.prototype.isCompleted = function() {
    return this.status === 'completed';
};

StudentCourseSection.prototype.hasGrade = function() {
    return this.final_grade !== null;
};

StudentCourseSection.prototype.getGradeLevel = function() {
    if (!this.final_grade) return null;
    
    if (this.final_grade >= 90) return 'A';
    if (this.final_grade >= 80) return 'B';
    if (this.final_grade >= 70) return 'C';
    if (this.final_grade >= 60) return 'D';
    return 'F';
};

module.exports = StudentCourseSection; 
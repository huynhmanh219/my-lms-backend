const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseSectionProgress = sequelize.define('CourseSectionProgress', {
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
    lectures_completed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total_lectures: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    completion_rate: {
        type: DataTypes.DECIMAL(5,2),
        allowNull: false,
        defaultValue: 0
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'course_section_progress',
    timestamps: false,
    underscored: true,
    indexes: [
        { unique: true, fields: ['student_id', 'course_section_id'] }
    ]
});

module.exports = CourseSectionProgress; 
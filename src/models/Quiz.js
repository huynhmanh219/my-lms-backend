// Quiz Model
// Quiz/Test model
// TODO: Implement in Phase 2 - Database Integration

/*
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'subjects',
            key: 'id'
        }
    },
    course_section_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'course_sections',
            key: 'id'
        }
    },
    lecturer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lecturers',
            key: 'id'
        }
    },
    total_points: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100
    },
    time_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Time limit in minutes'
    },
    attempts_allowed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    shuffle_questions: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    show_results: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'closed'),
        defaultValue: 'draft'
    }
}, {
    tableName: 'quizzes',
    timestamps: true,
    underscored: true
});

module.exports = Quiz;
*/

// Placeholder for Phase 2 implementation
module.exports = null; 
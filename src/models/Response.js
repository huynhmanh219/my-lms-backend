

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Response = sequelize.define('Response', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    submission_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'submissions',
            key: 'id'
        }
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'questions',
            key: 'id'
        }
    },
    answer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'answers',
            key: 'id'
        },
        comment: 'For multiple choice questions'
    },
    answer_text: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'For text-based answers'
    },
    is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    points_earned: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0.00
    },
    is_flagged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    time_spent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Time spent on this question in seconds'
    },
    attempt_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    graded_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'lecturers',
            key: 'id'
        }
    },
    grader_feedback: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    graded_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'responses',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['submission_id']
        },
        {
            fields: ['question_id']
        },
        {
            fields: ['submission_id', 'question_id'],
            unique: true
        },
        {
            fields: ['answer_id']
        },
        {
            fields: ['is_correct']
        }
    ]
});

Response.prototype.isCorrect = function() {
    return this.is_correct === true;
};

Response.prototype.isFlagged = function() {
    return this.is_flagged;
};

Response.prototype.isGraded = function() {
    return this.graded_at !== null;
};

Response.prototype.getTimeSpentFormatted = function() {
    if (!this.time_spent) return '0s';
    
    if (this.time_spent < 60) {
        return `${this.time_spent}s`;
    }
    
    const minutes = Math.floor(this.time_spent / 60);
    const seconds = this.time_spent % 60;
    return `${minutes}m ${seconds}s`;
};

module.exports = Response; 
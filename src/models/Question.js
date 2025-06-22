// Question Model
// Quiz question model for managing assessment questions

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    quiz_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'quizzes',
            key: 'id'
        }
    },
    question_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    question_type: {
        type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer', 'essay', 'fill_blank'),
        allowNull: false,
        defaultValue: 'multiple_choice'
    },
    points: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 1.00
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    explanation: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_required: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    time_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Individual question time limit in seconds'
    }
}, {
    tableName: 'questions',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['quiz_id']
        },
        {
            fields: ['quiz_id', 'order_index']
        },
        {
            fields: ['question_type']
        }
    ]
});

// Instance methods
Question.prototype.isMultipleChoice = function() {
    return this.question_type === 'multiple_choice';
};

Question.prototype.isTrueFalse = function() {
    return this.question_type === 'true_false';
};

Question.prototype.isEssay = function() {
    return this.question_type === 'essay';
};

Question.prototype.requiresManualGrading = function() {
    return ['essay', 'short_answer'].includes(this.question_type);
};

module.exports = Question; 


const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Answer = sequelize.define('Answer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'questions',
            key: 'id'
        }
    },
    answer_text: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
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
    image_url: {
        type: DataTypes.STRING(500),
        allowNull: true
    }
}, {
    tableName: 'answers',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['question_id']
        },
        {
            fields: ['question_id', 'order_index']
        },
        {
            fields: ['is_correct']
        }
    ]
});


Answer.prototype.isCorrectAnswer = function() {
    return this.is_correct;
};

module.exports = Answer; 
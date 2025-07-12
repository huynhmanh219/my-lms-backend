const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassChatMessage = sequelize.define('ClassChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_section_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'course_sections',
            key: 'id'
        }
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'class_chat_messages',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['course_section_id'] },
        { fields: ['sender_id'] }
    ]
});

module.exports = ClassChatMessage; 
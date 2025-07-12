const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discussion = sequelize.define('Discussion', {
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
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    is_locked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'discussions',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['course_section_id'] },
        { fields: ['created_by'] }
    ]
});

module.exports = Discussion; 
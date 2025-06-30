
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Chapter = sequelize.define('Chapter', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'subjects',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        defaultValue: 'active'
    }
}, {
    tableName: 'chapters',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['subject_id']
        },
        {
            fields: ['subject_id', 'order_index']
        },
        {
            fields: ['status']
        }
    ]
});


Chapter.prototype.isActive = function() {
    return this.status === 'active';
};

module.exports = Chapter; 
// Lecturer Model
// Lecturer profile model linked to Account

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lecturer = sequelize.define('Lecturer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'accounts',
            key: 'id'
        }
    },
    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    department: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'on_leave'),
        defaultValue: 'active'
    }
}, {
    tableName: 'lecturers',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['account_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['department']
        }
    ]
});

// Instance methods
Lecturer.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
};

Lecturer.prototype.getDisplayName = function() {
    const title = this.title ? `${this.title} ` : '';
    return `${title}${this.getFullName()}`;
};

Lecturer.prototype.isActive = function() {
    return this.status === 'active';
};

module.exports = Lecturer; 
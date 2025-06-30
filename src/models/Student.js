
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
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
    student_id: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
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
    date_of_birth: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    enrollment_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended'),
        defaultValue: 'active'
    }
}, {
    tableName: 'students',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['account_id']
        },
        {
            unique: true,
            fields: ['student_id']
        },
        {
            fields: ['status']
        }
    ]
});

Student.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
};

Student.prototype.isActive = function() {
    return this.status === 'active';
};

module.exports = Student; 
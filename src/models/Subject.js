// Subject Model
// Course/Subject model

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    subject_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    subject_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    credits: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: {
            min: 1,
            max: 10
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
    semester: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
            isIn: [['spring', 'summer', 'fall', 'winter']]
        }
    },
    academic_year: {
        type: DataTypes.STRING(10),
        allowNull: true,
        validate: {
            is: /^\d{4}-\d{4}$/
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'archived'),
        defaultValue: 'active'
    }
}, {
    tableName: 'subjects',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['subject_code']
        },
        {
            fields: ['lecturer_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['semester', 'academic_year']
        }
    ]
});

// Instance methods
Subject.prototype.getFullCode = function() {
    return `${this.subject_code} - ${this.subject_name}`;
};

Subject.prototype.isActive = function() {
    return this.status === 'active';
};

module.exports = Subject; 
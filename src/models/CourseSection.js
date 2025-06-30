
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseSection = sequelize.define('CourseSection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    section_name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'subjects',
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
    max_students: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
        validate: {
            min: 1,
            max: 200
        }
    },
    schedule: {
        type: DataTypes.JSON,
        allowNull: true
    },
    room: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isAfterStartDate(value) {
                if (this.start_date && value <= this.start_date) {
                    throw new Error('End date must be after start date');
                }
            }
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'completed', 'cancelled'),
        defaultValue: 'active'
    }
}, {
    tableName: 'course_sections',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['subject_id']
        },
        {
            fields: ['lecturer_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['start_date', 'end_date']
        }
    ]
});


CourseSection.prototype.isActive = function() {
    return this.status === 'active';
};

CourseSection.prototype.isOngoing = function() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return this.start_date <= today && today <= this.end_date;
};

CourseSection.prototype.getDurationDays = function() {
    const diffTime = Math.abs(this.end_date - this.start_date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = CourseSection;
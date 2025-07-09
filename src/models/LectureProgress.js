const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LectureProgress = sequelize.define('LectureProgress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    lecture_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lectures',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'in_progress'
    },
    time_spent_sec: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    scrolled_to_bottom: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    first_viewed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    last_viewed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'lecture_progress',
    timestamps: false,
    underscored: true,
    indexes: [
        { unique: true, fields: ['student_id', 'lecture_id'] },
        { fields: ['lecture_id', 'status'] },
        { fields: ['student_id', 'status'] }
    ]
});

LectureProgress.prototype.isCompleted = function () {
    return this.status === 'completed';
};

module.exports = LectureProgress; 
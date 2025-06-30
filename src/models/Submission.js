
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Submission = sequelize.define('Submission', {
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
    student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    attempt_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    time_spent: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Time spent in seconds'
    },
    score: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
    },
    max_score: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: true
    },
    percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('in_progress', 'submitted', 'graded', 'expired'),
        allowNull: false,
        defaultValue: 'in_progress'
    },
    ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true
    },
    user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_flagged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    flagged_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    graded_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    graded_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'lecturers',
            key: 'id'
        }
    }
}, {
    tableName: 'submissions',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['quiz_id']
        },
        {
            fields: ['student_id']
        },
        {
            fields: ['quiz_id', 'student_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['submitted_at']
        }
    ]
});

Submission.prototype.isInProgress = function() {
    return this.status === 'in_progress';
};

Submission.prototype.isSubmitted = function() {
    return this.status === 'submitted';
};

Submission.prototype.isGraded = function() {
    return this.status === 'graded';
};

Submission.prototype.isExpired = function() {
    return this.status === 'expired';
};

Submission.prototype.getTimeSpentFormatted = function() {
    if (!this.time_spent) return '0m';
    
    const minutes = Math.floor(this.time_spent / 60);
    const seconds = this.time_spent % 60;
    
    if (minutes > 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m ${seconds}s`;
    }
    
    return `${minutes}m ${seconds}s`;
};

Submission.prototype.getGrade = function() {
    if (!this.score || !this.max_score) return null;
    return (this.score / this.max_score * 100).toFixed(1);
};

module.exports = Submission; 
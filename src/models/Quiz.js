// Quiz Model
// Quiz/Test model for assessment management

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'subjects',
            key: 'id'
        }
    },
    course_section_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'course_sections',
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
    total_points: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 100.00
    },
    time_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Time limit in minutes'
    },
    attempts_allowed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1,
            max: 10
        }
    },
    shuffle_questions: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    shuffle_answers: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    show_results: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    show_correct_answers: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    start_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    end_time: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'closed'),
        defaultValue: 'draft'
    },
    instructions: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    passing_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        validate: {
            min: 0,
            max: 100
        }
    }
}, {
    tableName: 'quizzes',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['subject_id']
        },
        {
            fields: ['course_section_id']
        },
        {
            fields: ['lecturer_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['start_time', 'end_time']
        }
    ]
});

// Instance methods
Quiz.prototype.isPublished = function() {
    return this.status === 'published';
};

Quiz.prototype.isClosed = function() {
    return this.status === 'closed';
};

Quiz.prototype.isActive = function() {
    const now = new Date();
    return this.status === 'published' && 
           (!this.start_time || this.start_time <= now) &&
           (!this.end_time || this.end_time >= now);
};

Quiz.prototype.isUpcoming = function() {
    const now = new Date();
    return this.status === 'published' && 
           this.start_time && this.start_time > now;
};

Quiz.prototype.isExpired = function() {
    const now = new Date();
    return this.end_time && this.end_time < now;
};

Quiz.prototype.getTimeRemainingMinutes = function() {
    if (!this.end_time) return null;
    
    const now = new Date();
    const remaining = this.end_time - now;
    return Math.max(0, Math.floor(remaining / (1000 * 60)));
};

module.exports = Quiz; 
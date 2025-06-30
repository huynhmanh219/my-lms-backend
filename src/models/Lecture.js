

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lecture = sequelize.define('Lecture', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    chapter_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'chapters',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    video_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 480 // 8 hours max
        }
    },
    order_index: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    is_published: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'lectures',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['chapter_id']
        },
        {
            fields: ['chapter_id', 'order_index']
        },
        {
            fields: ['is_published']
        }
    ]
});


Lecture.prototype.isPublished = function() {
    return this.is_published;
};

Lecture.prototype.getDurationFormatted = function() {
    if (!this.duration_minutes) return null;
    
    const hours = Math.floor(this.duration_minutes / 60);
    const minutes = this.duration_minutes % 60;
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

module.exports = Lecture; 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LectureRating = sequelize.define('LectureRating', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lecture_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lectures',
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
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'lecture_ratings',
    timestamps: false,
    underscored: true,
    indexes: [
        {
            fields: ['lecture_id']
        },
        {
            fields: ['student_id']
        },
        {
            fields: ['lecture_id', 'student_id'],
            unique: true // Mỗi sinh viên chỉ đánh giá 1 lần cho 1 bài giảng
        },
        {
            fields: ['rating']
        }
    ]
});

// Instance methods
LectureRating.prototype.getStarDisplay = function() {
    return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
};

LectureRating.prototype.getFormattedDate = function() {
    return new Date().toLocaleDateString('vi-VN');
};

// Static methods
LectureRating.getAverageRating = async function(lectureId) {
    const result = await this.findOne({
        attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']
        ],
        where: { lecture_id: lectureId },
        raw: true
    });
    
    return {
        averageRating: result.avgRating ? parseFloat(result.avgRating).toFixed(1) : 0,
        totalRatings: parseInt(result.totalRatings) || 0
    };
};

LectureRating.getRatingDistribution = async function(lectureId) {
    const ratings = await this.findAll({
        attributes: [
            'rating',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { lecture_id: lectureId },
        group: ['rating'],
        raw: true
    });
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => {
        distribution[r.rating] = parseInt(r.count);
    });
    
    return distribution;
};

module.exports = LectureRating; 
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassRating = sequelize.define('ClassRating', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'course_sections',
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
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'class_ratings',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['class_id']
        },
        {
            fields: ['student_id']
        },
        {
            fields: ['class_id', 'student_id'],
            unique: true // Mỗi sinh viên chỉ đánh giá 1 lần cho 1 lớp học
        },
        {
            fields: ['rating']
        },
        {
            fields: ['created_at']
        }
    ]
});

// Instance methods
ClassRating.prototype.getStarDisplay = function() {
    return '★'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
};

ClassRating.prototype.getFormattedDate = function() {
    return new Date(this.created_at).toLocaleDateString('vi-VN');
};

// Static methods
ClassRating.getAverageRating = async function(classId) {
    const result = await this.findOne({
        attributes: [
            [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']
        ],
        where: { class_id: classId },
        raw: true
    });
    
    return {
        averageRating: result.avgRating ? parseFloat(result.avgRating).toFixed(1) : 0,
        totalRatings: parseInt(result.totalRatings) || 0
    };
};

ClassRating.getRatingDistribution = async function(classId) {
    const ratings = await this.findAll({
        attributes: [
            'rating',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: { class_id: classId },
        group: ['rating'],
        raw: true
    });
    
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(r => {
        distribution[r.rating] = parseInt(r.count);
    });
    
    return distribution;
};

ClassRating.getTopRatedClasses = async function(limit = 10) {
    const result = await this.findAll({
        attributes: [
            'class_id',
            [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'totalRatings']
        ],
        group: ['class_id'],
        having: sequelize.where(sequelize.fn('COUNT', sequelize.col('id')), '>=', 3), // Ít nhất 3 đánh giá
        order: [[sequelize.fn('AVG', sequelize.col('rating')), 'DESC']],
        limit,
        raw: true
    });
    
    return result.map(r => ({
        class_id: r.class_id,
        averageRating: parseFloat(r.avgRating).toFixed(1),
        totalRatings: parseInt(r.totalRatings)
    }));
};

module.exports = ClassRating; 
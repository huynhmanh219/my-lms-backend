const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DiscussionPost = sequelize.define('DiscussionPost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    discussion_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'discussions',
            key: 'id'
        }
    },
    parent_post_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'discussion_posts',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    posted_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'accounts',
            key: 'id'
        }
    }
}, {
    tableName: 'discussion_posts',
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['discussion_id'] },
        { fields: ['parent_post_id'] },
        { fields: ['posted_by'] }
    ]
});

module.exports = DiscussionPost; 
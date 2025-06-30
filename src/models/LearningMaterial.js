
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LearningMaterial = sequelize.define('LearningMaterial', {
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
    file_path: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    file_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    file_size: {
        type: DataTypes.BIGINT,
        allowNull: true
    },
    mime_type: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    material_type: {
        type: DataTypes.ENUM('document', 'video', 'audio', 'image', 'link'),
        defaultValue: 'document'
    },
    chapter_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'chapters',
            key: 'id'
        }
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'subjects',
            key: 'id'
        }
    },
    uploaded_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lecturers',
            key: 'id'
        }
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'learning_materials',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['subject_id']
        },
        {
            fields: ['chapter_id']
        },
        {
            fields: ['uploaded_by']
        },
        {
            fields: ['material_type']
        },
        {
            fields: ['is_public']
        }
    ]
});


LearningMaterial.prototype.getFileSizeFormatted = function() {
    if (!this.file_size) return null;
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (this.file_size === 0) return '0 Byte';
    
    const i = parseInt(Math.floor(Math.log(this.file_size) / Math.log(1024)));
    return Math.round(this.file_size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

LearningMaterial.prototype.isPublic = function() {
    return this.is_public;
};

LearningMaterial.prototype.hasFile = function() {
    return !!this.file_path;
};

module.exports = LearningMaterial; 
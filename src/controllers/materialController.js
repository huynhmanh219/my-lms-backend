const { LearningMaterial, Subject, Chapter, Lecturer, sequelize } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData } = require('../services/paginationService');
const fileService = require('../services/fileService');
const path = require('path');
const fs = require('fs').promises;

// Helper function to convert absolute path to relative path from uploads folder
const getRelativeFilePath = (absolutePath) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    return path.relative(uploadsDir, absolutePath).replace(/\\/g, '/'); // Normalize path separators
};

// Helper function to convert relative path back to absolute path  
const getAbsoluteFilePath = (relativePath) => {
    const uploadsDir = path.join(__dirname, '../../uploads');
    return path.join(uploadsDir, relativePath);
};

const materialController = {

    // GET /materials 
    getMaterials: async (req, res, next) => {
        try {
            const { page = 1, size = 10, search, subject_id, chapter_id, material_type, is_public } = req.query;
            const { limit, offset } = getPagination(page, size);

            const whereConditions = {};
            
            if (search) {
                whereConditions[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } }
                ];
            }

            if (subject_id) whereConditions.subject_id = subject_id;
            if (chapter_id) whereConditions.chapter_id = chapter_id;
            if (material_type) whereConditions.material_type = material_type;
            if (is_public !== undefined) whereConditions.is_public = is_public === 'true';

            const materials = await LearningMaterial.findAndCountAll({
                where: whereConditions,
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: Chapter, as: 'chapter', attributes: ['id', 'title'] },
                    { model: Lecturer, as: 'uploader', attributes: ['id', 'first_name', 'last_name'] }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']],
                distinct: true
            });

            const response = getPagingData(materials, page, limit);
            response.data = response.data.map(material => {
                const data = material.toJSON();
                data.file_size_formatted = material.getFileSizeFormatted();
                return data;
            });

            res.status(200).json({
                success: true,
                message: 'Materials retrieved successfully',
                data: response
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /materials/:id 
    getMaterial: async (req, res, next) => {
        try {
            const { id } = req.params;

            const material = await LearningMaterial.findByPk(id, {
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: Chapter, as: 'chapter', attributes: ['id', 'title'] },
                    { model: Lecturer, as: 'uploader', attributes: ['id', 'first_name', 'last_name'] }
                ]
            });

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
            }

            const materialData = material.toJSON();
            materialData.file_size_formatted = material.getFileSizeFormatted();

            res.status(200).json({
                success: true,
                message: 'Material retrieved successfully',
                data: materialData
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /materials 
    createMaterial: async (req, res, next) => {
        try {
            const {
                title,
                description,
                subject_id,
                chapter_id,
                material_type = 'document',
                is_public = false
            } = req.body;

            const userId = req.user.id;
            const lecturer = await Lecturer.findOne({ where: { account_id: userId } });
            
            if (!lecturer) {
                return res.status(403).json({
                    success: false,
                    message: 'Only lecturers can create materials'
                });
            }

            const material = await LearningMaterial.create({
                title,
                description,
                subject_id,
                chapter_id,
                material_type,
                uploaded_by: lecturer.id,
                is_public
            });

            const createdMaterial = await LearningMaterial.findByPk(material.id, {
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: Chapter, as: 'chapter', attributes: ['id', 'title'] }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Material created successfully',
                data: createdMaterial
            });
        } catch (error) {
            next(error);
        }
    },

    // PUT /materials/:id 
    updateMaterial: async (req, res, next) => {
        try {
            const { id } = req.params;
            const { title, description, material_type, is_public } = req.body;

            const material = await LearningMaterial.findByPk(id);
            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
            }

            await material.update({
                title: title || material.title,
                description: description !== undefined ? description : material.description,
                material_type: material_type || material.material_type,
                is_public: is_public !== undefined ? is_public : material.is_public
            });

            const updatedMaterial = await LearningMaterial.findByPk(id, {
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: Chapter, as: 'chapter', attributes: ['id', 'title'] }
                ]
            });

            res.status(200).json({
                success: true,
                message: 'Material updated successfully',
                data: updatedMaterial
            });
        } catch (error) {
            next(error);
        }
    },

    // DELETE /materials/:id 
    deleteMaterial: async (req, res, next) => {
        try {
            const { id } = req.params;

            const material = await LearningMaterial.findByPk(id);
            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
            }

            // Delete associated file if exists
            if (material.file_path) {
                try {
                    await fileService.deleteFile(material.file_path);
                } catch (error) {
                    console.error('Error deleting file:', error);
                }
            }

            await material.destroy();

            res.status(200).json({
                success: true,
                message: 'Material deleted successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /materials/:id/details 
    getMaterialDetails: async (req, res, next) => {
        try {
            const { id } = req.params;

            const material = await LearningMaterial.findByPk(id, {
                include: [
                    { 
                        model: Subject, 
                        as: 'subject', 
                        attributes: ['id', 'subject_name', 'subject_code', 'description'],
                        include: [{ model: Lecturer, as: 'lecturer', attributes: ['id', 'first_name', 'last_name'] }]
                    },
                    { model: Chapter, as: 'chapter', attributes: ['id', 'title', 'description'] },
                    { model: Lecturer, as: 'uploader', attributes: ['id', 'first_name', 'last_name'] }
                ]
            });

            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
            }

            const materialData = material.toJSON();
            materialData.file_size_formatted = material.getFileSizeFormatted();
            materialData.has_file = material.hasFile();

            res.status(200).json({
                success: true,
                message: 'Material details retrieved successfully',
                data: materialData
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /materials/upload 
    uploadMaterial: async (req, res, next) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const {
                title,
                description,
                subject_id,
                chapter_id,
                material_type = 'document',
                is_public = false
            } = req.body;

            const userId = req.user.id;
            const lecturer = await Lecturer.findOne({ where: { account_id: userId } });

            // Convert absolute path to relative path for storage
            const relativeFilePath = getRelativeFilePath(req.file.path);

            const material = await LearningMaterial.create({
                title: title || req.file.originalname,
                description,
                file_path: relativeFilePath, // Store relative path
                file_name: req.file.originalname,
                file_size: req.file.size,
                mime_type: req.file.mimetype,
                subject_id,
                chapter_id,
                material_type,
                uploaded_by: lecturer.id,
                is_public
            });

            const createdMaterial = await LearningMaterial.findByPk(material.id, {
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: Chapter, as: 'chapter', attributes: ['id', 'title'] },
                    { model: Lecturer, as: 'uploader', attributes: ['id', 'first_name', 'last_name'] }
                ]
            });

            res.status(201).json({
                success: true,
                message: 'Material uploaded successfully',
                data: createdMaterial
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /materials/:id/download 
    downloadMaterial: async (req, res, next) => {
        try {
            const { id } = req.params;

            const material = await LearningMaterial.findByPk(id);
            if (!material) {
                return res.status(404).json({
                    success: false,
                    message: 'Material not found'
                });
            }

            if (!material.file_path) {
                return res.status(404).json({
                    success: false,
                    message: 'No file associated with this material'
                });
            }

            // Convert relative file path back to absolute path
            const absoluteFilePath = getAbsoluteFilePath(material.file_path);

            const fileExists = await fileService.fileExists(absoluteFilePath);
            if (!fileExists) {
                return res.status(404).json({
                    success: false,
                    message: 'File not found on server'
                });
            }

            const headers = fileService.createDownloadHeaders(
                material.file_name || `material_${material.id}`,
                material.mime_type
            );

            res.set(headers);
            res.sendFile(path.resolve(absoluteFilePath));
        } catch (error) {
            next(error);
        }
    },

    // POST /materials/upload-multiple 
    uploadMultipleMaterials: async (req, res, next) => {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No files uploaded'
                });
            }

            const { subject_id, chapter_id, is_public = false } = req.body;
            const userId = req.user.id;
            const lecturer = await Lecturer.findOne({ where: { account_id: userId } });

            const materials = [];
            for (const file of req.files) {
                // Convert absolute path to relative path for storage
                const relativeFilePath = getRelativeFilePath(file.path);
                
                const material = await LearningMaterial.create({
                    title: file.originalname,
                    file_path: relativeFilePath, // Store relative path
                    file_name: file.originalname,
                    file_size: file.size,
                    mime_type: file.mimetype,
                    subject_id,
                    chapter_id,
                    material_type: 'document',
                    uploaded_by: lecturer.id,
                    is_public
                });
                materials.push(material);
            }

            res.status(201).json({
                success: true,
                message: `${materials.length} materials uploaded successfully`,
                data: materials
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /materials/search 
    searchMaterials: async (req, res, next) => {
        try {
            const { query, page = 1, size = 10 } = req.query;
            const { limit, offset } = getPagination(page, size);

            if (!query) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const materials = await LearningMaterial.findAndCountAll({
                where: {
                    [Op.or]: [
                        { title: { [Op.like]: `%${query}%` } },
                        { description: { [Op.like]: `%${query}%` } },
                        { file_name: { [Op.like]: `%${query}%` } }
                    ]
                },
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: Chapter, as: 'chapter', attributes: ['id', 'title'] },
                    { model: Lecturer, as: 'uploader', attributes: ['id', 'first_name', 'last_name'] }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']],
                distinct: true
            });

            const response = getPagingData(materials, page, limit);
            res.status(200).json({
                success: true,
                message: 'Search completed successfully',
                data: response,
                query
            });
        } catch (error) {
            next(error);
        }
    },

    // GET /materials/recent 
    getRecentMaterials: async (req, res, next) => {
        try {
            const { page = 1, size = 10, days = 7 } = req.query;
            const { limit, offset } = getPagination(page, size);

            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - parseInt(days));

            const materials = await LearningMaterial.findAndCountAll({
                where: {
                    created_at: {
                        [Op.gte]: dateThreshold
                    }
                },
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: Chapter, as: 'chapter', attributes: ['id', 'title'] },
                    { model: Lecturer, as: 'uploader', attributes: ['id', 'first_name', 'last_name'] }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']],
                distinct: true
            });

            const response = getPagingData(materials, page, limit);
            res.status(200).json({
                success: true,
                message: 'Recent materials retrieved successfully',
                data: response
            });
        } catch (error) {
            next(error);
        }
    },

        // GET /materials/by-type 
    getMaterialsByType: async (req, res, next) => {
        try {
            const { type, page = 1, size = 10 } = req.query;
            const { limit, offset } = getPagination(page, size);

            if (!type) {
                return res.status(400).json({
                    success: false,
                    message: 'Material type is required'
                });
            }

            const materials = await LearningMaterial.findAndCountAll({
                where: { material_type: type },
                include: [
                    { model: Subject, as: 'subject', attributes: ['id', 'subject_name', 'subject_code'] },
                    { model: Chapter, as: 'chapter', attributes: ['id', 'title'] },
                    { model: Lecturer, as: 'uploader', attributes: ['id', 'first_name', 'last_name'] }
                ],
                limit,
                offset,
                order: [['created_at', 'DESC']],
                distinct: true
            });

            const response = getPagingData(materials, page, limit);
            res.status(200).json({
                success: true,
                message: `Materials of type '${type}' retrieved successfully`,
                data: response
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = materialController; 
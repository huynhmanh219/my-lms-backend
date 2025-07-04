
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const fileService = {
    validateFileType: (file, allowedTypes) => {
        const fileExtension = path.extname(file.originalname).toLowerCase();
        return allowedTypes.includes(fileExtension);
    },

    getFileSizeMB: (file) => {
        return (file.size / (1024 * 1024)).toFixed(2);
    },

    generateUniqueFilename: (originalName) => {
        const extension = path.extname(originalName);
        const basename = path.basename(originalName, extension);
        const uniqueId = uuidv4();
        return `${basename}_${uniqueId}${extension}`;
    },

    saveFileWithMetadata: async (file, uploadPath, metadata = {}) => {
        try {
            const uniqueFilename = fileService.generateUniqueFilename(file.originalname);
            const filePath = path.join(uploadPath, uniqueFilename);
            
            await fs.mkdir(uploadPath, { recursive: true });
            
            await fs.rename(file.path, filePath);
            
            return {
                originalName: file.originalname,
                filename: uniqueFilename,
                path: filePath,
                size: file.size,
                mimetype: file.mimetype,
                uploadDate: new Date(),
                ...metadata
            };
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
    },

    deleteFile: async (filePath) => {
        try {
            await fs.unlink(filePath);
            console.log(`File deleted: ${filePath}`);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error('Error deleting file:', error);
                throw error;
            }
        }
    },

    fileExists: async (filePath) => {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    },

    getFileStats: async (filePath) => {
        try {
            const stats = await fs.stat(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory()
            };
        } catch (error) {
            console.error('Error getting file stats:', error);
            throw error;
        }
    },

    createDownloadHeaders: (filename, mimetype) => {
        return {
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Type': mimetype || 'application/octet-stream'
        };
    },

    validateFileSize: (file, maxSizeMB) => {
        const fileSizeMB = fileService.getFileSizeMB(file);
        return fileSizeMB <= maxSizeMB;
    },
    
    cleanupOldFiles: async (directory, maxAgeHours = 24) => {
        try {
            const files = await fs.readdir(directory);
            const now = Date.now();
            const maxAge = maxAgeHours * 60 * 60 * 1000;
            
            for (const file of files) {
                const filePath = path.join(directory, file);
                const stats = await fs.stat(filePath);
                
                if (now - stats.mtime.getTime() > maxAge) {
                    await fileService.deleteFile(filePath);
                }
            }
        } catch (error) {
            console.error('Error cleaning up old files:', error);
        }
    }
};

module.exports = fileService; 
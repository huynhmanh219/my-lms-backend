// Multer Configuration for File Uploads
// This file handles file upload configuration and validation

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = uploadDir;
        
        // Create subdirectories based on file type
        if (file.fieldname === 'avatar') {
            uploadPath = path.join(uploadDir, 'avatars');
        } else if (file.fieldname === 'material') {
            uploadPath = path.join(uploadDir, 'materials');
        } else if (file.fieldname === 'document') {
            uploadPath = path.join(uploadDir, 'documents');
        }
        
        // Ensure subdirectory exists
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Define allowed file types
    const allowedTypes = {
        avatar: /jpeg|jpg|png|gif/,
        material: /pdf|doc|docx|ppt|pptx|xls|xlsx|txt/,
        document: /pdf|doc|docx|txt/
    };
    
    const extname = allowedTypes[file.fieldname]?.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes[file.fieldname]?.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type'));
    }
};

// Multer configuration
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: fileFilter
});

module.exports = upload; 
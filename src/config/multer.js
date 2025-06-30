
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = uploadDir;
        
        if (file.fieldname === 'avatar') {
            uploadPath = path.join(uploadDir, 'avatars');
        } else if (file.fieldname === 'material') {
            uploadPath = path.join(uploadDir, 'materials');
        } else if (file.fieldname === 'document') {
            uploadPath = path.join(uploadDir, 'documents');
        }
        
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        avatar: /jpeg|jpg|png|gif/,
        material: /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|mp4|avi|mov|wmv|flv|webm|jpg|jpeg|png|gif|bmp|svg|webp/,
        document: /pdf|doc|docx|txt/
    };
    
    const allowedMimeTypes = {
        avatar: /^image\/(jpeg|jpg|png|gif)$/,
        material: /^(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)|text\/plain|video\/(mp4|avi|quicktime|x-msvideo|x-flv|webm)|image\/(jpeg|png|gif|bmp|svg\+xml|webp))$/,
        document: /^(application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|text\/plain)$/
    };
    
    const extname = allowedTypes[file.fieldname]?.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedMimeTypes[file.fieldname]?.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        console.error('File validation failed:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            extension: path.extname(file.originalname).toLowerCase(),
            extname_valid: extname,
            mimetype_valid: mimetype
        });
        cb(new Error(`Invalid file type. Allowed types for ${file.fieldname}: ${allowedTypes[file.fieldname]}`));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024
    },
    fileFilter: fileFilter
});

module.exports = upload; 
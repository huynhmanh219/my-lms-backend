const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// GET /uploads/avatars/:filename
router.get('/avatars/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/avatars', filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            status: 'error',
            message: 'File not found'
        });
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
    };
    
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
    res.setHeader('ETag', `"${filename}"`);
    
    res.sendFile(filePath);
});

module.exports = router; 
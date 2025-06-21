// Material Management Routes
// Routes for managing learning materials, file operations, and search

const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { auth } = require('../middleware/auth');
const { requireLecturer } = require('../middleware/roleCheck');
const { validateQuery, validateParams } = require('../middleware/validation');
const { commonSchemas } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/multer');

// Material CRUD Routes
router.get('/',
    auth,
    validateQuery(commonSchemas.pagination),
    materialController.getMaterials
);

router.post('/',
    auth,
    requireLecturer,
    materialController.createMaterial
);

router.put('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    materialController.updateMaterial
);

router.delete('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    materialController.deleteMaterial
);

// File Operations Routes
router.post('/upload',
    auth,
    requireLecturer,
    uploadLimiter,
    upload.single('material'),
    materialController.uploadMaterial
);

router.get('/:id/download',
    auth,
    validateParams(commonSchemas.id),
    materialController.downloadMaterial
);

router.post('/upload-multiple',
    auth,
    requireLecturer,
    uploadLimiter,
    upload.array('materials', 10),
    materialController.uploadMultipleMaterials
);

// Search & Discovery Routes
router.get('/search',
    auth,
    materialController.searchMaterials
);

router.get('/filter',
    auth,
    materialController.filterMaterials
);

router.get('/recent',
    auth,
    materialController.getRecentMaterials
);

module.exports = router;
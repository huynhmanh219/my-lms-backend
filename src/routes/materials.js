// Material Management Routes
// Routes for managing learning materials, file operations, and search

const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { auth } = require('../middleware/auth');
const { requireLecturer } = require('../middleware/roleCheck');
const { validate, validateQuery, validateParams } = require('../middleware/validation');
const { commonSchemas, materialSchemas } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/multer');

// ================================
// MATERIAL CRUD ROUTES (6 APIs)
// ================================

router.get('/',
    auth,
    validateQuery(materialSchemas.materialPagination),
    materialController.getMaterials
);

router.get('/:id',
    auth,
    validateParams(commonSchemas.id),
    materialController.getMaterial
);

router.post('/',
    auth,
    requireLecturer,
    validate(materialSchemas.createMaterial),
    materialController.createMaterial
);

router.put('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    validate(materialSchemas.updateMaterial),
    materialController.updateMaterial
);

router.delete('/:id',
    auth,
    requireLecturer,
    validateParams(commonSchemas.id),
    materialController.deleteMaterial
);

router.get('/:id/details',
    auth,
    validateParams(commonSchemas.id),
    materialController.getMaterialDetails
);

// ================================
// FILE OPERATIONS ROUTES (7 APIs)
// ================================

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

// ================================
// SEARCH & DISCOVERY ROUTES (6 APIs)
// ================================

router.get('/search',
    auth,
    validateQuery(materialSchemas.searchMaterials),
    materialController.searchMaterials
);

router.get('/recent',
    auth,
    validateQuery(materialSchemas.recentMaterials),
    materialController.getRecentMaterials
);

router.get('/by-type',
    auth,
    validateQuery(materialSchemas.materialsByType),
    materialController.getMaterialsByType
);

module.exports = router;
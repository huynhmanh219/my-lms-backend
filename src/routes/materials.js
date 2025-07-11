
const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { auth } = require('../middleware/auth');
const { requireLecturer } = require('../middleware/roleCheck');
const { validate, validateQuery, validateParams } = require('../middleware/validation');
const { commonSchemas, materialSchemas } = require('../middleware/validation');
const { uploadLimiter } = require('../middleware/rateLimiter');
const upload = require('../config/multer');



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


router.post('/upload',
    auth,
    requireLecturer,
    uploadLimiter,
    upload.single('material'),
    materialController.uploadMaterial
);

router.post('/upload-multiple',
    auth,
    requireLecturer,
    uploadLimiter,
    upload.array('materials', 10),
    materialController.uploadMultipleMaterials
);

    

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

router.get('/:id/download',
    auth,
    validateParams(commonSchemas.id),
    materialController.downloadMaterial
);

module.exports = router;
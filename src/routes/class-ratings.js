const express = require('express');
const router = express.Router();
const classRatingController = require('../controllers/classRatingController');
const { auth } = require('../middleware/auth');
const { requireStudent, requireLecturer } = require('../middleware/roleCheck');

// Student routes - Rating classes
router.get('/class/:classId/ratings', classRatingController.getClassRatings);
router.get('/class/:classId/stats', classRatingController.getClassRatingStats);
router.get('/class/:classId/my-rating', auth, requireStudent, classRatingController.getMyClassRating);
router.post('/', auth, requireStudent, classRatingController.createClassRating);
router.put('/:id', auth, requireStudent, classRatingController.updateClassRating);
// Cho phép sinh viên (chủ rating) hoặc admin xóa
const { requireAdmin } = require('../middleware/roleCheck');
router.delete('/:id', auth, classRatingController.deleteClassRating);

// General routes
router.get('/top-rated', classRatingController.getTopRatedClasses);
router.get('/my-ratings', auth, requireStudent, classRatingController.getMyClassRatings);

// Admin routes
router.get('/pending', auth, requireAdmin, classRatingController.getPendingRatings);
router.put('/:id/approve', auth, requireAdmin, classRatingController.approveRating);

module.exports = router; 
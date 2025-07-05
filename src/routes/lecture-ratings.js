const express = require('express');
const router = express.Router();
const lectureRatingController = require('../controllers/lectureRatingController');
const { auth } = require('../middleware/auth');
const { requireStudent, requireLecturer } = require('../middleware/roleCheck');


router.get('/lectures/:lectureId/ratings', lectureRatingController.getLectureRatings);
router.post('/lectures/:lectureId/ratings', auth, requireStudent, lectureRatingController.createLectureRating);
router.get('/lectures/:lectureId/my-rating', auth, requireStudent, lectureRatingController.getMyRating);
router.put('/lecture-ratings/:id', auth, requireStudent, lectureRatingController.updateLectureRating);
router.delete('/lecture-ratings/:id', auth, requireStudent, lectureRatingController.deleteLectureRating);

router.get('/my-lectures/ratings', auth, requireLecturer, lectureRatingController.getMyLectureRatings);

module.exports = router; 


const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const { auth } = require('../middleware/auth');
const { requireLecturer, requireAdmin } = require('../middleware/roleCheck');


router.get('/dashboard',
    auth,
    statisticsController.getDashboardStats
);

router.get('/students',
    auth,
    requireLecturer,
    statisticsController.getStudentStats
);

router.get('/teachers',
    auth,
    requireAdmin,
    statisticsController.getTeacherStats
);

router.get('/courses',
    auth,
    requireLecturer,
    statisticsController.getCourseStats
);

router.get('/classes',
    auth,
    requireLecturer,
    statisticsController.getClassStats
);


router.get('/reports/student-progress',
    auth,
    requireLecturer,
    statisticsController.getStudentProgress
);

router.get('/reports/class-performance',
    auth,
    requireLecturer,
    statisticsController.getClassPerformance
);

router.get('/reports/quiz-analytics',
    auth,
    requireLecturer,
    statisticsController.getQuizAnalytics
);

router.get('/reports/attendance',
    auth,
    requireLecturer,
    statisticsController.getAttendanceReport
);

router.get('/reports/grades',
    auth,
    requireLecturer,
    statisticsController.getGradesReport
);

router.get('/subjects-status',
    auth,
    requireAdmin,
    statisticsController.getSubjectStatusTrend
);

router.get('/publish-status',
    auth,
    requireAdmin,
    statisticsController.getPublishStatusTotals
);

router.get('/account-totals',
    auth,
    requireAdmin,
    statisticsController.getAccountRoleTotals
);

router.get('/top-subjects',
    auth,
    requireAdmin,
    statisticsController.getTopSubjectsByClasses
);

module.exports = router; 
// src/routes/teacher.routes.js
const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isTeacherOrAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isTeacherOrAdmin);

router.get('/courses/', teacherController.getTeacherCourses);
router.get('/course-progress/:course_id', teacherController.getCourseProgress);
router.get('/export-progress/:user_id', teacherController.exportProgressStudent);
router.get('/report-by-course/:course_id', teacherController.reportByCourse);

module.exports = router;
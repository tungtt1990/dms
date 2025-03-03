// src/routes/course.routes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Lấy danh sách khóa học
router.get('/', authenticateToken, courseController.getAllCourses);
// Đăng ký học viên vào khóa học
router.post('/:courseId/enroll', authenticateToken, courseController.enrollCourse);

module.exports = router;

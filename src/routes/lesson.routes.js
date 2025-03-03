// src/routes/lesson.routes.js
const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Lấy danh sách bài giảng cho một khóa học
router.get('/:courseId', authenticateToken, lessonController.getLessonsByCourse);

module.exports = router;

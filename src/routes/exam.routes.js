// src/routes/exam.routes.js
const express = require('express');
const router = express.Router();
const examController = require('../controllers/exam.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Lấy thông tin kỳ thi cho một khóa học
router.get('/:courseId', authenticateToken, examController.getExamsByCourse);
// Ghi nhận phiên thi của học viên
router.post('/session', authenticateToken, examController.recordTestSession);

module.exports = router;

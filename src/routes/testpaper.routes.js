// src/routes/testpaper.routes.js
const express = require('express');
const router = express.Router();
const testpaperController = require('../controllers/testpaper.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Giáo viên tạo bộ đề thi mới
router.post('/', authenticateToken, testpaperController.createTestPaper);
// Lấy bộ đề thi của giáo viên
router.get('/my', authenticateToken, testpaperController.getTestPapersByTeacher);

module.exports = router;

// src/routes/slidewatch.routes.js
const express = require('express');
const router = express.Router();
const slidewatchController = require('../controllers/slidewatch.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Cập nhật thông tin tổng hợp slideshow
router.put('/updateSlideCompleted', authenticateToken, slidewatchController.updateSlideCompleted);

module.exports = router;
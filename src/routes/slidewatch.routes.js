// src/routes/slidewatch.routes.js
const express = require('express');
const router = express.Router();
const slidewatchController = require('../controllers/slidewatch.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Ghi nhận phiên xem slideshow
router.post('/session', authenticateToken, slidewatchController.recordSession);
// Cập nhật thông tin tổng hợp slideshow
router.put('/aggregate', authenticateToken, slidewatchController.updateAggregate);

module.exports = router;

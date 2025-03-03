// src/routes/videowatch.routes.js
const express = require('express');
const router = express.Router();
const videowatchController = require('../controllers/videowatch.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Ghi nhận phiên xem video chi tiết
router.post('/session', authenticateToken, videowatchController.recordSession);
// Cập nhật thông tin tổng hợp xem video
router.put('/aggregate', authenticateToken, videowatchController.updateAggregate);

module.exports = router;

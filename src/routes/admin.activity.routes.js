// src/routes/admin.activity.routes.js
const express = require('express');
const router = express.Router();
const adminActivityController = require('../controllers/admin.activity.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

// Endpoint lấy tất cả log xem video (có thể phân trang, lọc theo ngày)
router.get('/videowatch', adminActivityController.getAllVideoWatchLogs);

// Endpoint lấy tất cả log xem slideshow
router.get('/slidewatch', adminActivityController.getAllSlideWatchLogs);

module.exports = router;

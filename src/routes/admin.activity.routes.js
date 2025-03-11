// src/routes/admin.activity.routes.js
const express = require('express');
const router = express.Router();
const adminActivityController = require('../controllers/admin.activity.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /videowatch:
 *   get:
 *     summary: Retrieve all video watch logs
 *     description: Retrieve all video watch logs with optional pagination and date filtering.
 *     tags: [Admin Activity]
 *     responses:
 *       200:
 *         description: A list of video watch logs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Endpoint lấy tất cả log xem video (có thể phân trang, lọc theo ngày)
router.get('/videowatch', adminActivityController.getAllVideoWatchLogs);

/**
 * @swagger
 * /slidewatch:
 *   get:
 *     summary: Retrieve all slide watch logs
 *     description: Retrieve all slide watch logs.
 *     tags: [Admin Activity]
 *     responses:
 *       200:
 *         description: A list of slide watch logs.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Endpoint lấy tất cả log xem slideshow
router.get('/slidewatch', adminActivityController.getAllSlideWatchLogs);

module.exports = router;
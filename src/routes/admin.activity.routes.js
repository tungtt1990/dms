// src/routes/admin.activity.routes.js
const express = require('express');
const router = express.Router();
const adminActivityController = require('../controllers/admin.activity.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /admin/activity/videowatch:
 *   get:
 *     summary: Retrieve all video watch logs
 *     description: Retrieve all video watch logs with optional pagination and date filtering.
 *     tags: [Admin Activity]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items per page
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date for filtering logs
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date for filtering logs
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
 * /admin/activity/slidewatch:
 *   get:
 *     summary: Retrieve all slide watch logs
 *     description: Retrieve all slide watch logs.
 *     tags: [Admin Activity]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items per page
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: The start date for filtering logs
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: The end date for filtering logs
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
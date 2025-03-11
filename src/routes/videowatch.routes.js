// src/routes/videowatch.routes.js
const express = require('express');
const router = express.Router();
const videowatchController = require('../controllers/videowatch.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /videowatch/session:
 *   post:
 *     summary: Record a video viewing session
 *     description: Record a new video viewing session.
 *     tags: [Videowatch]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               video_id:
 *                 type: string
 *                 description: The ID of the video
 *               user_id:
 *                 type: string
 *                 description: The ID of the user
 *               duration:
 *                 type: integer
 *                 description: The duration of the viewing session in seconds
 *     responses:
 *       201:
 *         description: Session recorded successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Ghi nhận phiên xem video chi tiết
router.post('videowatch/session', authenticateToken, videowatchController.recordSession);

/**
 * @swagger
 * /videowatch/aggregate:
 *   put:
 *     summary: Update video watch aggregate
 *     description: Update the aggregate data for video watches.
 *     tags: [Videowatch]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               video_id:
 *                 type: string
 *                 description: The ID of the video
 *               watch_count:
 *                 type: integer
 *                 description: The number of times the video has been watched
 *     responses:
 *       200:
 *         description: Aggregate updated successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Cập nhật thông tin tổng hợp xem video
router.put('videowatch/aggregate', authenticateToken, videowatchController.updateAggregate);

module.exports = router;
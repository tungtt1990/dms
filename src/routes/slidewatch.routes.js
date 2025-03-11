// src/routes/slidewatch.routes.js
const express = require('express');
const router = express.Router();
const slidewatchController = require('../controllers/slidewatch.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /slidewatch/session:
 *   post:
 *     summary: Record a slideshow viewing session
 *     description: Record a new slideshow viewing session.
 *     tags: [Slidewatch]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slide_id:
 *                 type: string
 *                 description: The ID of the slide
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
// Ghi nhận phiên xem slideshow
router.post('videowatch/session', authenticateToken, slidewatchController.recordSession);

/**
 * @swagger
 * /slidewatch/aggregate:
 *   put:
 *     summary: Update slide watch aggregate
 *     description: Update the aggregate data for slide watches.
 *     tags: [Slidewatch]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slide_id:
 *                 type: string
 *                 description: The ID of the slide
 *               watch_count:
 *                 type: integer
 *                 description: The number of times the slide has been watched
 *     responses:
 *       200:
 *         description: Aggregate updated successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Cập nhật thông tin tổng hợp slideshow
router.put('videowatch/aggregate', authenticateToken, slidewatchController.updateAggregate);

module.exports = router;
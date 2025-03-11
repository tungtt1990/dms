// src/routes/admin.slidewatch.routes.js
const express = require('express');
const router = express.Router();
const slideWatchController = require('../controllers/admin.slidewatch.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /slidewatch:
 *   put:
 *     summary: Update slide watch aggregate
 *     description: Update the aggregate data for slide watches.
 *     tags: [Admin Slide Watch]
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
// PUT cập nhật dữ liệu tổng hợp cho slide watch
router.put('/slidewatch', slideWatchController.updateAggregate);

module.exports = router;
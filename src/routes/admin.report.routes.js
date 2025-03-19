// src/routes/admin.user.routes.js
const express = require('express');
const router = express.Router();
const adminReportController = require('../controllers/admin.report.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isTeacherOrAdmin } = require('../middlewares/admin.middleware');

// Áp dụng middleware xác thực và kiểm tra admin cho tất cả các endpoint sau
router.use(authenticateToken, isTeacherOrAdmin);

/**
 * @swagger
 * /admin/report:
 *   get:
 *     summary: Export report progress learning
 *     description: Export report progress learning
 *     tags: [Admin User, Teacher User]
 *     responses:
 *       200:
 *         description: Export report progress learning successfull.
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
// GET /api/admin/report - Export báo cáo tiến độ học tập
router.get('/:user_id', adminReportController.exportProgressLearning);

module.exports = router;
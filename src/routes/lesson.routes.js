// src/routes/lesson.routes.js
const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /lessons/{courseId}:
 *   get:
 *     summary: Retrieve lessons by course ID
 *     description: Retrieve a list of lessons for a specific course by course ID.
 *     tags: [Lesson]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: A list of lessons.
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
 *       404:
 *         description: Course not found
 */
// Lấy danh sách bài giảng cho một khóa học
router.get('/lessons/:courseId', authenticateToken, lessonController.getLessonsByCourse);

module.exports = router;
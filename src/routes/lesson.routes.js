// src/routes/lesson.routes.js
const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lesson.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /lessons/{subjectId}:
 *   get:
 *     summary: Retrieve lessons by subject ID and type
 *     description: Retrieve a list of lessons for a specific subject by subject ID and type.
 *     tags: [Lesson]
 *     parameters:
 *       - in: path
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the subject
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
 *         description: Lessons not found
 */
// Lấy danh sách bài giảng theo ID môn học và loại
// Absolute path: /{subjectId}
router.get('/:subjectId/:lessonType', authenticateToken, lessonController.getSlideLessons);
router.get('/practice-exercises/:exercise_id', authenticateToken, lessonController.getPracticeExercisesDetails);

module.exports = router;
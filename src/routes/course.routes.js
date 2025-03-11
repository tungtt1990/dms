// src/routes/course.routes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Retrieve all courses
 *     description: Retrieve a list of all courses.
 *     tags: [Course]
 *     responses:
 *       200:
 *         description: A list of courses.
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
// Lấy danh sách khóa học
router.get('/courses', authenticateToken, courseController.getAllCourses);

/**
 * @swagger
 * /courses/{courseId}/enroll:
 *   post:
 *     summary: Enroll a student in a course
 *     description: Enroll a student in a specific course by course ID.
 *     tags: [Course]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Student enrolled successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */
// Đăng ký học viên vào khóa học
router.post('/courses/:courseId/enroll', authenticateToken, courseController.enrollCourse);

module.exports = router;
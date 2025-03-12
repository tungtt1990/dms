// src/routes/admin.lesson.routes.js
const express = require('express');
const router = express.Router();
const adminLessonController = require('../controllers/admin.lesson.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /admin/lessons:
 *   get:
 *     summary: Retrieve all lessons
 *     description: Retrieve a list of all lessons.
 *     tags: [Admin Lesson]
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
 */
// CRUD cho Lesson - Lấy tất cả bài học
// Absolute path: /admin/lessons
router.get('/', adminLessonController.getAllLessons);

/**
 * @swagger
 * /admin/lessons/{id}:
 *   get:
 *     summary: Retrieve a lesson by ID
 *     description: Retrieve a specific lesson by its ID.
 *     tags: [Admin Lesson]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *     responses:
 *       200:
 *         description: A lesson object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 */
// CRUD cho Lesson - Lấy bài học theo ID
// Absolute path: /admin/lessons/{id}
router.get('/:id', adminLessonController.getLessonById);

/**
 * @swagger
 * /admin/lessons:
 *   post:
 *     summary: Create a new lesson
 *     description: Create a new lesson.
 *     tags: [Admin Lesson]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lesson_name:
 *                 type: string
 *                 description: The name of the lesson
 *               description:
 *                 type: string
 *                 description: The description of the lesson
 *               content:
 *                 type: string
 *                 description: The content of the lesson
 *     responses:
 *       201:
 *         description: Lesson created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// CRUD cho Lesson - Tạo bài học mới
// Absolute path: /admin/lessons
router.post('/', adminLessonController.createLesson);

/**
 * @swagger
 * /admin/lessons/{id}:
 *   put:
 *     summary: Update a lesson by ID
 *     description: Update a specific lesson by its ID.
 *     tags: [Admin Lesson]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lesson_name:
 *                 type: string
 *                 description: The name of the lesson
 *               description:
 *                 type: string
 *                 description: The description of the lesson
 *               content:
 *                 type: string
 *                 description: The content of the lesson
 *     responses:
 *       200:
 *         description: Lesson updated successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 */
// CRUD cho Lesson - Cập nhật bài học theo ID
// Absolute path: /admin/lessons/{id}
router.put('/:id', adminLessonController.updateLesson);

/**
 * @swagger
 * /admin/lessons/{id}:
 *   delete:
 *     summary: Delete a lesson by ID
 *     description: Delete a specific lesson by its ID.
 *     tags: [Admin Lesson]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The lesson ID
 *     responses:
 *       200:
 *         description: Lesson deleted successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Lesson not found
 */
// CRUD cho Lesson - Xóa bài học theo ID
// Absolute path: /admin/lessons/{id}
router.delete('/:id', adminLessonController.deleteLesson);

module.exports = router;
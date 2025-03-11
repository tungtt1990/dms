// src/routes/admin.practice.routes.js
const express = require('express');
const router = express.Router();
const adminPracticeController = require('../controllers/admin.practice.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /practices:
 *   get:
 *     summary: Retrieve all exercises
 *     description: Retrieve a list of all exercises.
 *     tags: [Admin Practice]
 *     responses:
 *       200:
 *         description: A list of exercises.
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
// CRUD cho Practice - Lấy tất cả bài tập
router.get('/practices', adminPracticeController.getAllExercises);

/**
 * @swagger
 * /practices/{id}:
 *   get:
 *     summary: Retrieve an exercise by ID
 *     description: Retrieve a specific exercise by its ID.
 *     tags: [Admin Practice]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The exercise ID
 *     responses:
 *       200:
 *         description: An exercise object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exercise not found
 */
// CRUD cho Practice - Lấy bài tập theo ID
router.get('/practices/:id', adminPracticeController.getExerciseById);

/**
 * @swagger
 * /practices:
 *   post:
 *     summary: Create a new exercise
 *     description: Create a new exercise.
 *     tags: [Admin Practice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exercise_name:
 *                 type: string
 *                 description: The name of the exercise
 *               description:
 *                 type: string
 *                 description: The description of the exercise
 *               content:
 *                 type: string
 *                 description: The content of the exercise
 *     responses:
 *       201:
 *         description: Exercise created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// CRUD cho Practice - Tạo bài tập mới
router.post('/practices', adminPracticeController.createExercise);

/**
 * @swagger
 * /practices/{id}:
 *   put:
 *     summary: Update an exercise by ID
 *     description: Update a specific exercise by its ID.
 *     tags: [Admin Practice]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The exercise ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               exercise_name:
 *                 type: string
 *                 description: The name of the exercise
 *               description:
 *                 type: string
 *                 description: The description of the exercise
 *               content:
 *                 type: string
 *                 description: The content of the exercise
 *     responses:
 *       200:
 *         description: Exercise updated successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exercise not found
 */
// CRUD cho Practice - Cập nhật bài tập theo ID
router.put('/practices/:id', adminPracticeController.updateExercise);

/**
 * @swagger
 * /practices/{id}:
 *   delete:
 *     summary: Delete an exercise by ID
 *     description: Delete a specific exercise by its ID.
 *     tags: [Admin Practice]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The exercise ID
 *     responses:
 *       200:
 *         description: Exercise deleted successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Exercise not found
 */
// CRUD cho Practice - Xóa bài tập theo ID
router.delete('/practices/:id', adminPracticeController.deleteExercise);

module.exports = router;
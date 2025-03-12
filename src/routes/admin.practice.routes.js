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
router.get('/', adminPracticeController.getAllExercises);

/**
 * @swagger
 * /admin/practices/{id}:
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
router.get('/:id', adminPracticeController.getExerciseById);

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
router.post('/', adminPracticeController.createExercise);

/**
 * @swagger
 * /admin/practices/{id}:
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
router.put('/:id', adminPracticeController.updateExercise);

/**
 * @swagger
 * /admin/practices/{id}:
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
router.delete('/:id', adminPracticeController.deleteExercise);

/**
 * @swagger
 * /practice-exercise-questions:
 *   post:
 *     summary: Add multiple questions to a practice exercise
 *     description: Add multiple questions to a practice exercise.
 *     tags: [Admin Practice Exercise Question]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 question_text:
 *                   type: string
 *                   description: The text of the question
 *                 options:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       option_text:
 *                         type: string
 *                         description: The text of the option
 *                       is_correct:
 *                         type: boolean
 *                         description: Whether the option is correct
 *     responses:
 *       201:
 *         description: Questions added successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Endpoint thêm nhiều câu hỏi vào bài tập thực hành
router.post('/practice-exercise-questions', adminPracticeController.createMultiplePracticeExerciseQuestions);

module.exports = router;
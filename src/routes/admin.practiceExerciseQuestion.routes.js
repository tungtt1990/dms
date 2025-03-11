// src/routes/admin.practiceExerciseQuestion.routes.js
const express = require('express');
const router = express.Router();
const practiceExerciseQuestionController = require('../controllers/admin.practiceExerciseQuestion.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// Áp dụng middleware cho admin
router.use(authenticateToken, isAdmin);

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
router.post('/practice-exercise-questions', practiceExerciseQuestionController.createMultiplePracticeExerciseQuestions);

module.exports = router;
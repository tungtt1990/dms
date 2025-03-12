// src/routes/admin.question.routes.js
const express = require('express');
const router = express.Router();
const adminQuestionController = require('../controllers/admin.question.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Retrieve all questions
 *     description: Retrieve a list of all questions including their answers.
 *     tags: [Admin Question]
 *     responses:
 *       200:
 *         description: A list of questions.
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
// GET tất cả câu hỏi (bao gồm đáp án)
router.get('/', adminQuestionController.getAllQuestions);

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Retrieve a question by ID
 *     description: Retrieve a specific question by its ID including its answers.
 *     tags: [Admin Question]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID
 *     responses:
 *       200:
 *         description: A question object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Question not found
 */
// GET chi tiết câu hỏi theo ID (bao gồm danh sách đáp án)
router.get('/:id', adminQuestionController.getQuestionById);

/**
 * @swagger
 * /questions:
 *   post:
 *     summary: Create a new question
 *     description: Create a new question along with its answers.
 *     tags: [Admin Question]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_text:
 *                 type: string
 *                 description: The text of the question
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     option_text:
 *                       type: string
 *                       description: The text of the option
 *                     is_correct:
 *                       type: boolean
 *                       description: Whether the option is correct
 *     responses:
 *       201:
 *         description: Question created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// POST tạo câu hỏi mới cùng với các đáp án
router.post('/', adminQuestionController.createQuestion);

/**
 * @swagger
 * /questions/{id}:
 *   put:
 *     summary: Update a question by ID
 *     description: Update a specific question by its ID along with its answers.
 *     tags: [Admin Question]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question_text:
 *                 type: string
 *                 description: The text of the question
 *               options:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     option_text:
 *                       type: string
 *                       description: The text of the option
 *                     is_correct:
 *                       type: boolean
 *                       description: Whether the option is correct
 *     responses:
 *       200:
 *         description: Question updated successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Question not found
 */
// PUT cập nhật câu hỏi (và cập nhật đáp án)
router.put('/:id', adminQuestionController.updateQuestion);

/**
 * @swagger
 * /questions/{id}:
 *   delete:
 *     summary: Delete a question by ID
 *     description: Delete a specific question by its ID. Answers will be deleted via cascade.
 *     tags: [Admin Question]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The question ID
 *     responses:
 *       200:
 *         description: Question deleted successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Question not found
 */
// DELETE xóa câu hỏi (đáp án sẽ bị xóa theo cascade)
router.delete('/:id', adminQuestionController.deleteQuestion);

module.exports = router;
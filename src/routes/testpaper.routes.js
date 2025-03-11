// src/routes/testpaper.routes.js
const express = require('express');
const router = express.Router();
const testpaperController = require('../controllers/testpaper.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /testpapers:
 *   post:
 *     summary: Create a new test paper
 *     description: Create a new test paper.
 *     tags: [Test Paper]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paper_name:
 *                 type: string
 *                 description: The name of the test paper
 *               description:
 *                 type: string
 *                 description: The description of the test paper
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     question_text:
 *                       type: string
 *                       description: The text of the question
 *                     options:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           option_text:
 *                             type: string
 *                             description: The text of the option
 *                           is_correct:
 *                             type: boolean
 *                             description: Whether the option is correct
 *     responses:
 *       201:
 *         description: Test paper created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Giáo viên tạo bộ đề thi mới
router.post('/testpapers', authenticateToken, testpaperController.createTestPaper);

/**
 * @swagger
 * /testpapers/my:
 *   get:
 *     summary: Retrieve test papers by teacher
 *     description: Retrieve a list of test papers created by the authenticated teacher.
 *     tags: [Test Paper]
 *     responses:
 *       200:
 *         description: A list of test papers.
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
// Lấy bộ đề thi của giáo viên
router.get('/testpapers/my', authenticateToken, testpaperController.getTestPapersByTeacher);

module.exports = router;
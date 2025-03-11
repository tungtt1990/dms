// src/routes/admin.testpaper.routes.js
const express = require('express');
const router = express.Router();
const adminTestpaperController = require('../controllers/admin.testpaper.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /testpapers:
 *   get:
 *     summary: Retrieve all test papers
 *     description: Retrieve a list of all test papers.
 *     tags: [Admin Test Paper]
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
// GET tất cả đề thi
router.get('/testpapers', adminTestpaperController.getAllTestPapers);

/**
 * @swagger
 * /testpapers/{id}:
 *   get:
 *     summary: Retrieve a test paper by ID
 *     description: Retrieve a specific test paper by its ID.
 *     tags: [Admin Test Paper]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The test paper ID
 *     responses:
 *       200:
 *         description: A test paper object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test paper not found
 */
// GET đề thi theo ID
router.get('/testpapers/:id', adminTestpaperController.getTestPaperById);

/**
 * @swagger
 * /testpapers:
 *   post:
 *     summary: Create a new test paper
 *     description: Create a new test paper.
 *     tags: [Admin Test Paper]
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
// POST tạo đề thi mới
router.post('/testpapers', adminTestpaperController.createTestPaper);

/**
 * @swagger
 * /testpapers/{id}:
 *   put:
 *     summary: Update a test paper by ID
 *     description: Update a specific test paper by its ID.
 *     tags: [Admin Test Paper]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The test paper ID
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
 *       200:
 *         description: Test paper updated successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test paper not found
 */
// PUT cập nhật đề thi theo ID
router.put('/testpapers/:id', adminTestpaperController.updateTestPaper);

/**
 * @swagger
 * /testpapers/{id}:
 *   delete:
 *     summary: Delete a test paper by ID
 *     description: Delete a specific test paper by its ID.
 *     tags: [Admin Test Paper]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The test paper ID
 *     responses:
 *       200:
 *         description: Test paper deleted successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test paper not found
 */
// DELETE xóa đề thi theo ID
router.delete('/testpapers/:id', adminTestpaperController.deleteTestPaper);

/**
 * @swagger
 * /testpapers/random:
 *   get:
 *     summary: Retrieve a random test paper
 *     description: Retrieve a random test paper based on specified criteria.
 *     tags: [Admin Test Paper]
 *     parameters:
 *       - in: query
 *         name: paper_type
 *         schema:
 *           type: string
 *         description: The type of test paper
 *     responses:
 *       200:
 *         description: A random test paper object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Test paper not found
 */
// GET đề thi ngẫu nhiên
router.get('/testpapers/random', adminTestpaperController.getRandomTestPaper);

module.exports = router;
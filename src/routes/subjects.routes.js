// src/routes/subject.routes.js
const express = require('express');
const router = express.Router();
const subjectsController = require('../controllers/subjects.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /subjects/{subjectId}:
 *   get:
 *     summary: Retrieve subjects by subject ID and type
 *     description: Retrieve a list of subjects for a specific subject by subject ID and type.
 *     tags: [Subject]
 *     responses:
 *       200:
 *         description: A list of subjects.
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
 *         description: subjects not found
 */
// Lấy danh sách bài giảng theo ID môn học và loại
// Absolute path: /{subjectId}
router.get('/', authenticateToken, subjectsController.getAllSubjects);

module.exports = router;
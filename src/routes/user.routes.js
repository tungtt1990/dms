// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Retrieve user profile
 *     description: Retrieve the profile of the authenticated user.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 */
// GET /users/profile - Lấy thông tin hồ sơ người dùng
router.get('/profile', authenticateToken, userController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the profile of the authenticated user.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               email:
 *                 type: string
 *                 description: The email of the user
 *     responses:
 *       200:
 *         description: User profile updated successfully.
 *       401:
 *         description: Unauthorized
 */
// PUT /users/profile - Cập nhật thông tin hồ sơ người dùng
router.put('/profile', authenticateToken, userController.updateProfile);

/**
 * @swagger
 * /users/login-history:
 *   get:
 *     summary: Retrieve login history
 *     description: Retrieve the login history of the authenticated user.
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Login history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 */
// GET /users/login-history - Lấy lịch sử đăng nhập
router.get('/login-history', authenticateToken, userController.getLoginHistory);

module.exports = router;
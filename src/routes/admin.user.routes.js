// src/routes/admin.user.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // Lưu file trong bộ nhớ
const adminUserController = require('../controllers/admin.user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// Áp dụng middleware xác thực và kiểm tra admin cho tất cả các endpoint sau
router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     description: Retrieve a list of all users.
 *     tags: [Admin User]
 *     responses:
 *       200:
 *         description: A list of users.
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
// GET /api/admin/users - Lấy danh sách tất cả người dùng
router.get('/users', adminUserController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Retrieve a user by ID
 *     description: Retrieve a specific user by their ID.
 *     tags: [Admin User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A user object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
// GET /api/admin/users/:id - Lấy thông tin chi tiết của 1 người dùng theo id
router.get('/users/:id', adminUserController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user.
 *     tags: [Admin User]
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
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       201:
 *         description: User created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// POST /api/admin/users - Tạo mới người dùng
router.post('/users', adminUserController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     description: Update a specific user by their ID.
 *     tags: [Admin User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
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
 *               password:
 *                 type: string
 *                 description: The password of the user
 *     responses:
 *       200:
 *         description: User updated successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
// PUT /api/admin/users/:id - Cập nhật thông tin người dùng
router.put('/users/:id', adminUserController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     description: Delete a specific user by their ID.
 *     tags: [Admin User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
// DELETE /api/admin/users/:id - Xóa người dùng
router.delete('/users/:id', adminUserController.deleteUser);

/**
 * @swagger
 * /users/import:
 *   post:
 *     summary: Import users from an Excel file
 *     description: Import users from an Excel file.
 *     tags: [Admin User]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Users imported successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// POST /api/admin/users/importUsers - Import Users từ file excel
router.post('/users/import', upload.single('file'), adminUserController.importUsers);

/**
 * @swagger
 * /users/admin:
 *   post:
 *     summary: Create a new admin user
 *     description: Create a new admin user.
 *     tags: [Admin User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the admin user
 *               email:
 *                 type: string
 *                 description: The email of the admin user
 *               password:
 *                 type: string
 *                 description: The password of the admin user
 *     responses:
 *       201:
 *         description: Admin user created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// Endpoint riêng tạo user admin
router.post('/users/admin', adminUserController.createAdminUser);

module.exports = router;
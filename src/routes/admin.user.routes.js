// src/routes/admin.user.routes.js
const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/admin.user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// Áp dụng middleware xác thực và kiểm tra admin cho tất cả các endpoint sau
router.use(authenticateToken, isAdmin);

// GET /api/admin/users - Lấy danh sách tất cả người dùng
router.get('/', adminUserController.getAllUsers);

// GET /api/admin/users/:id - Lấy thông tin chi tiết của 1 người dùng theo id
router.get('/:id', adminUserController.getUserById);

// POST /api/admin/users - Tạo mới người dùng
router.post('/', adminUserController.createUser);

// PUT /api/admin/users/:id - Cập nhật thông tin người dùng
router.put('/:id', adminUserController.updateUser);

// DELETE /api/admin/users/:id - Xóa người dùng
router.delete('/:id', adminUserController.deleteUser);

// Endpoint riêng tạo user admin
router.post('/admin', adminUserController.createAdminUser);

module.exports = router;

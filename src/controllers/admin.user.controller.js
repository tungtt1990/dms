// src/controllers/admin.user.controller.js
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// Lấy danh sách tất cả người dùng
exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT user_id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

// Lấy thông tin chi tiết người dùng theo ID
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'SELECT user_id, username, email, full_name, role, created_at FROM users WHERE user_id = $1',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Error fetching user by id:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

// Tạo mới người dùng (cho các role khác ngoài admin)
exports.createUser = async (req, res) => {
    const { username, email, password, full_name, role } = req.body;

    // Nếu role là admin, yêu cầu phải sử dụng endpoint createAdminUser
    if (role && role.toLowerCase() === 'admin') {
        return res.status(400).json({ error: 'Use createAdminUser endpoint to create admin user' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (username, email, password, full_name, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
            [username, email, hashedPassword, full_name, role || 'student']
        );
        res.status(201).json({ message: 'User created', user_id: result.rows[0].user_id });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
};


// Endpoint riêng để tạo user với role admin (chỉ admin được gọi)
exports.createAdminUser = async (req, res) => {
    // Kiểm tra lại, nếu người gọi không phải admin, trả lỗi
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can create admin user' });
    }

    const { username, email, password, full_name } = req.body;
    const role = 'admin'; // Ép role luôn là admin
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO users (username, email, password, full_name, role)
            VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
            [username, email, hashedPassword, full_name, role]
        );
        res.status(201).json({ message: 'Admin user created', user_id: result.rows[0].user_id });
    } catch (error) {
        console.error('Error creating admin user:', error);
        res.status(500).json({ error: 'Failed to create admin user' });
    }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { username, email, password, full_name, role } = req.body;
    try {
        let query = 'UPDATE users SET ';
        const params = [];
        let idx = 1;
        if (username) {
            query += `username = $${idx}, `;
            params.push(username);
            idx++;
        }
        if (email) {
            query += `email = $${idx}, `;
            params.push(email);
            idx++;
        }
        if (full_name) {
            query += `full_name = $${idx}, `;
            params.push(full_name);
            idx++;
        }
        if (role) {
            query += `role = $${idx}, `;
            params.push(role);
            idx++;
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += `password = $${idx}, `;
            params.push(hashedPassword);
            idx++;
        }
        // Loại bỏ dấu phẩy cuối và thêm cập nhật thời gian
        query = query.slice(0, -2);
        query += `, updated_at = NOW() WHERE user_id = $${idx} RETURNING user_id, username, email, full_name, role`;
        params.push(id);

        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User updated', user: result.rows[0] });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            'DELETE FROM users WHERE user_id = $1 RETURNING user_id, username, email, full_name, role',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted', user: result.rows[0] });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

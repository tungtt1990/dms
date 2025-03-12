const pool = require('../config/db');

// Lấy danh sách người dùng với JOIN user_profiles, filter, sort, phân trang
exports.getAllUsers = async (req, res) => {
  try {
    const { role, email, sort_by = 'u.created_at', sort_order = 'DESC', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const conditions = ['u.deleted_at IS NULL'];
    const params = [];
    let paramIndex = 1;
    
    if (role) {
      conditions.push(`u.role = $${paramIndex++}`);
      params.push(role);
    }
    if (email) {
      conditions.push(`u.email ILIKE $${paramIndex++}`);
      params.push(`%${email}%`);
    }
    
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    
    const query = `
      SELECT u.user_id, u.username, u.email, u.full_name, u.role, u.created_at,
             up.registration_code, up.profile_number, up.date_of_birth, up.gender,
             up.nationality, up.id_card, up.permanent_address, up.residence, up.date_received, up.rank
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id AND up.deleted_at IS NULL
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    res.json({ users: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT u.user_id, u.username, u.email, u.full_name, u.role, u.created_at,
             up.registration_code, up.profile_number, up.date_of_birth, up.gender,
             up.nationality, up.id_card, up.permanent_address, up.residence, up.date_received, up.rank
      FROM users u
      LEFT JOIN user_profiles up ON u.user_id = up.user_id AND up.deleted_at IS NULL
      WHERE u.user_id = $1 AND u.deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Error fetching user by id:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.createUser = async (req, res) => {
  const { username, email, password, full_name, role } = req.body;
  try {
    const hashedPassword = await require('bcrypt').hash(password.toString(), 10);
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

exports.createAdminUser = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admin can create admin user' });
  }
  const { username, email, password, full_name } = req.body;
  try {
    const hashedPassword = await require('bcrypt').hash(password.toString(), 10);
    const result = await pool.query(
      `INSERT INTO users (username, email, password, full_name, role)
       VALUES ($1, $2, $3, $4, 'admin') RETURNING user_id`,
      [username, email, hashedPassword, full_name]
    );
    res.status(201).json({ message: 'Admin user created', user_id: result.rows[0].user_id });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
};

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
      if (role.toLowerCase() === 'admin' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Only admin can update role to admin' });
      }
      query += `role = $${idx}, `;
      params.push(role);
      idx++;
    }
    if (password) {
      const hashedPassword = await require('bcrypt').hash(password.toString(), 10);
      query += `password = $${idx}, `;
      params.push(hashedPassword);
      idx++;
    }
    query = query.slice(0, -2); // Loại bỏ dấu phẩy cuối
    query += `, updated_at = NOW() WHERE user_id = $${idx} RETURNING user_id, username, email, full_name, role`;
    params.push(id);
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated', user: result.rows[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE users SET deleted_at = NOW() WHERE user_id = $1 AND deleted_at IS NULL RETURNING user_id, username, email, full_name, role',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted', user: result.rows[0] });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.importUsers = async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    try {
      // Đọc file Excel từ buffer
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      // Chuyển đổi dữ liệu sheet thành mảng JSON
      const usersData = xlsx.utils.sheet_to_json(worksheet);
      
      if (!usersData.length) {
        return res.status(400).json({ error: 'No user data found in file' });
      }
  
      await pool.query('BEGIN');
      for (const row of usersData) {
        // Lấy dữ liệu từ file Excel
        // Các cột chính có: full_name, và các cột bổ sung trong file: 
        // "Mã đăng ký", "Số Hồ sơ", "Họ và tên", "Ngày sinh", "Giới tính", "Quốc tịch", "Số CMND/ HC", "Địa chỉ thường trú", "Nơi cư trú", "Ngày nhận Hồ sơ", "Hạng"
        // File không có email và role nên ta generate:
        let { username, full_name, password } = row;
        if (!full_name || !password) {
          // Bỏ qua dòng nếu thiếu thông tin bắt buộc
          continue;
        }
        // Nếu username không có, generate từ full_name
        if (!username) {
          username = generateUsername(full_name);
        }
        // Generate email dựa trên username (ví dụ: username@example.com)
        const email = username + '@example.com';
        // Role mặc định là "student"
        const role = 'student';
        
        const hashedPassword = await bcrypt.hash(password.toString(), 10);
        
        // Chèn vào bảng users
        const userResult = await pool.query(
          `INSERT INTO users (username, email, password, full_name, role)
           VALUES ($1, $2, $3, $4, $5) RETURNING user_id`,
          [username, email, hashedPassword, full_name, role]
        );
        const user_id = userResult.rows[0].user_id;
        
        // Các trường bổ sung cho bảng user_profiles
        const registration_code = row["Mã đăng ký"] || null;
        const profile_number = row["Số Hồ sơ"] || null;
        // Sử dụng cột "Họ và tên" trong file nếu có, nếu không dùng full_name
        const profile_full_name = row["Họ và tên"] || full_name;
        const date_of_birth = row["Ngày sinh"] ? new Date(row["Ngày sinh"]) : null;
        const gender = row["Giới tính"] || null;
        const nationality = row["Quốc tịch"] || null;
        const id_card = row["Số CMND/ HC"] || null;
        const permanent_address = row["Địa chỉ thường trú"] || null;
        const residence = row["Nơi cư trú"] || null;
        const date_received = row["Ngày nhận Hồ sơ"] ? new Date(row["Ngày nhận Hồ sơ"]) : null;
        const rank = row["Hạng"] || null;
        
        // Chèn vào bảng user_profiles
        await pool.query(
          `INSERT INTO user_profiles 
             (user_id, registration_code, profile_number, full_name, date_of_birth, gender, nationality, id_card, permanent_address, residence, date_received, rank)
           VALUES 
             ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [user_id, registration_code, profile_number, profile_full_name, date_of_birth, gender, nationality, id_card, permanent_address, residence, date_received, rank]
        );
      }
      await pool.query('COMMIT');
      res.json({ message: 'Users imported successfully', count: usersData.length });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error importing users:', error);
      res.status(500).json({ error: 'Failed to import users' });
    }
  };

function generateUsername(full_name) {
    let username = full_name.toLowerCase();
    // Loại bỏ dấu tiếng Việt
    username = username.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Thay khoảng trắng bằng dấu gạch dưới
    username = username.replace(/\s+/g, '_');
    // Loại bỏ ký tự đặc biệt
    username = username.replace(/[^\w_]/g, '');
    // Thêm 2 chữ số random
    const randomDigits = Math.floor(10 + Math.random() * 90);
    return username + randomDigits.toString();
  }

module.exports = exports;


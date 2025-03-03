// src/controllers/user.controller.js
const pool = require('../config/db');

exports.getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, username, email, full_name, role FROM users WHERE user_id = $1',
      [req.user.user_id]
    );
    res.json({ profile: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  const { full_name, email } = req.body;
  try {
    await pool.query(
      'UPDATE users SET full_name = $1, email = $2, updated_at = NOW() WHERE user_id = $3',
      [full_name, email, req.user.user_id]
    );
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
};

exports.getLoginHistory = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT login_time, logout_time, ip_address, device_info FROM login_history WHERE user_id = $1 ORDER BY login_time DESC',
      [req.user.user_id]
    );
    res.json({ history: result.rows });
  } catch (error) {
    console.error('Get login history error:', error);
    res.status(500).json({ error: 'Failed to fetch login history' });
  }
};

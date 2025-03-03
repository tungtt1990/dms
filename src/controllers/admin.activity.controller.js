// src/controllers/admin.activity.controller.js
const pool = require('../config/db');

// Lấy tất cả log chi tiết phiên xem video (có thể thêm điều kiện lọc, phân trang)
exports.getAllVideoWatchLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM video_watch_sessions ORDER BY session_start DESC');
    res.json({ video_logs: result.rows });
  } catch (error) {
    console.error('Error fetching video watch logs:', error);
    res.status(500).json({ error: 'Failed to fetch video watch logs' });
  }
};

// Lấy tất cả log chi tiết phiên xem slideshow
exports.getAllSlideWatchLogs = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM slide_watch_sessions ORDER BY session_start DESC');
    res.json({ slide_logs: result.rows });
  } catch (error) {
    console.error('Error fetching slide watch logs:', error);
    res.status(500).json({ error: 'Failed to fetch slide watch logs' });
  }
};

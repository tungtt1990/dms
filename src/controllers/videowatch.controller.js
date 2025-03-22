// src/controllers/videowatch.controller.js
const pool = require('../config/db');


exports.updateSession = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { video_lesson_id, start_session, end_session } = req.body;

    if (!video_lesson_id || start_session === undefined || end_session === undefined || start_session >= end_session) {
      return res.status(400).json({ error: "Dữ liệu không hợp lệ!" });
    }

    // Lưu phiên xem vào database
    await pool.query(
      `INSERT INTO video_watch_sessions (user_id, video_lesson_id, start_session, end_session, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [user_id, video_lesson_id, start_session, end_session]
    );

    res.json({ message: "Đã lưu phiên xem video!" });
  } catch (error) {
    console.error("Lỗi khi lưu phiên xem video:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
};
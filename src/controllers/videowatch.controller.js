// src/controllers/videowatch.controller.js
const pool = require('../config/db');

exports.recordSession = async (req, res) => {
  const { video_lesson_id, session_start, session_end, milestones } = req.body;
  const user_id = req.user.user_id;
  try {
    await pool.query(
      `INSERT INTO video_watch_sessions (user_id, video_lesson_id, session_start, session_end, milestones)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, video_lesson_id, session_start, session_end, JSON.stringify(milestones)]
    );
    res.json({ message: 'Video watch session recorded' });
  } catch (error) {
    console.error('Record video session error:', error);
    res.status(500).json({ error: 'Failed to record session' });
  }
};

exports.updateAggregate = async (req, res) => {
  const { video_lesson_id, additional_watch_time, last_stop_time, status } = req.body;
  const user_id = req.user.user_id;

  try {
    // Lấy min_required_time từ videolessons
    const videoRes = await pool.query(
      'SELECT min_required_time FROM videolessons WHERE video_lesson_id = $1',
      [video_lesson_id]
    );
    if (videoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Video lesson not found' });
    }
    const minRequired = videoRes.rows[0].min_required_time || 0;

    // Kiểm tra aggregate hiện có không
    const aggRes = await pool.query(
      'SELECT total_watch_time FROM video_watch_aggregates WHERE user_id = $1 AND video_lesson_id = $2',
      [user_id, video_lesson_id]
    );

    if (aggRes.rows.length > 0) {
      let currentTime = aggRes.rows[0].total_watch_time || 0;
      // Nếu tổng đã đạt tối đa, không cộng thêm
      let newTime = currentTime < minRequired ? currentTime + additional_watch_time : currentTime;
      if (newTime > minRequired) newTime = minRequired;
      // Nếu đạt đủ thời gian yêu cầu, status chuyển thành "complete"
      const newStatus = (newTime >= minRequired) ? 'complete' : status;
      await pool.query(
        `UPDATE video_watch_aggregates 
         SET last_stop_time = $1, total_watch_time = $2, status = $3, updated_at = NOW()
         WHERE user_id = $4 AND video_lesson_id = $5`,
        [last_stop_time, newTime, newStatus, user_id, video_lesson_id]
      );
    } else {
      // Nếu chưa có aggregate, khởi tạo và giới hạn không vượt quá minRequired
      const initialTime = (additional_watch_time > minRequired) ? minRequired : additional_watch_time;
      const newStatus = (initialTime >= minRequired) ? 'complete' : status;
      await pool.query(
        `INSERT INTO video_watch_aggregates (user_id, video_lesson_id, last_stop_time, total_watch_time, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, video_lesson_id, last_stop_time, initialTime, newStatus]
      );
    }
    res.json({ message: 'Video aggregate updated' });
  } catch (error) {
    console.error('Update video aggregate error:', error);
    res.status(500).json({ error: 'Failed to update aggregate' });
  }
};
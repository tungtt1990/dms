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
  const { video_lesson_id, last_stop_time, additional_watch_time, status } = req.body;
  const user_id = req.user.user_id;
  try {
    // Cập nhật aggregate nếu đã tồn tại, nếu không thì chèn mới
    const result = await pool.query(
      'SELECT * FROM video_watch_aggregates WHERE user_id = $1 AND video_lesson_id = $2',
      [user_id, video_lesson_id]
    );
    if (result.rows.length > 0) {
      await pool.query(
        `UPDATE video_watch_aggregates 
         SET last_stop_time = $1, total_watch_time = total_watch_time + $2, status = $3, updated_at = NOW()
         WHERE user_id = $4 AND video_lesson_id = $5`,
        [last_stop_time, additional_watch_time, status, user_id, video_lesson_id]
      );
    } else {
      await pool.query(
        `INSERT INTO video_watch_aggregates (user_id, video_lesson_id, last_stop_time, total_watch_time, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, video_lesson_id, last_stop_time, additional_watch_time, status]
      );
    }
    res.json({ message: 'Video aggregate updated' });
  } catch (error) {
    console.error('Update video aggregate error:', error);
    res.status(500).json({ error: 'Failed to update aggregate' });
  }
};

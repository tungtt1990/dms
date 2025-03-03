// src/controllers/slidewatch.controller.js
const pool = require('../config/db');

exports.recordSession = async (req, res) => {
  const { slide_lesson_id, session_start, session_end, milestones } = req.body;
  const user_id = req.user.user_id;
  try {
    await pool.query(
      `INSERT INTO slide_watch_sessions (user_id, slide_lesson_id, session_start, session_end, milestones)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, slide_lesson_id, session_start, session_end, JSON.stringify(milestones)]
    );
    res.json({ message: 'Slide watch session recorded' });
  } catch (error) {
    console.error('Record slide session error:', error);
    res.status(500).json({ error: 'Failed to record slide session' });
  }
};

exports.updateAggregate = async (req, res) => {
  const { slide_lesson_id, last_stop_time, additional_watch_time, status } = req.body;
  const user_id = req.user.user_id;
  try {
    const result = await pool.query(
      'SELECT * FROM slide_watch_aggregates WHERE user_id = $1 AND slide_lesson_id = $2',
      [user_id, slide_lesson_id]
    );
    if (result.rows.length > 0) {
      await pool.query(
        `UPDATE slide_watch_aggregates 
         SET last_stop_time = $1, total_watch_time = total_watch_time + $2, status = $3, updated_at = NOW()
         WHERE user_id = $4 AND slide_lesson_id = $5`,
        [last_stop_time, additional_watch_time, status, user_id, slide_lesson_id]
      );
    } else {
      await pool.query(
        `INSERT INTO slide_watch_aggregates (user_id, slide_lesson_id, last_stop_time, total_watch_time, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, slide_lesson_id, last_stop_time, additional_watch_time, status]
      );
    }
    res.json({ message: 'Slide aggregate updated' });
  } catch (error) {
    console.error('Update slide aggregate error:', error);
    res.status(500).json({ error: 'Failed to update slide aggregate' });
  }
};

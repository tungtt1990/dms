// src/controllers/admin.slidewatch.controller.js
const pool = require('../config/db');

// Endpoint cập nhật tổng hợp phiên xem slideshow
exports.updateAggregate = async (req, res) => {
  const { slide_lesson_id, additional_watch_time, last_stop_time, status } = req.body;
  const user_id = req.user.user_id;

  try {
    // Lấy min_time_per_slide từ slidelessons
    const slideRes = await pool.query(
      'SELECT min_time_per_slide, slide_count, total_time FROM slidelessons WHERE slide_lesson_id = $1',
      [slide_lesson_id]
    );
    if (slideRes.rows.length === 0) {
      return res.status(404).json({ error: 'Slide lesson not found' });
    }
    const { min_time_per_slide, total_time } = slideRes.rows[0];
    
    // Giả sử rằng tổng thời gian tối đa đạt được cho từng slide là min_time_per_slide
    // Và achieved_percentage = (total_watch_time / (min_time_per_slide * slide_count)) * 100
    const slideCount = slideRes.rows[0].slide_count || 1;
    const maxTotalTime = min_time_per_slide * slideCount;

    const aggRes = await pool.query(
      'SELECT total_watch_time FROM slide_watch_aggregates WHERE user_id = $1 AND slide_lesson_id = $2',
      [user_id, slide_lesson_id]
    );

    if (aggRes.rows.length > 0) {
      let currentTime = aggRes.rows[0].total_watch_time || 0;
      let newTime = currentTime + additional_watch_time;
      if (newTime > maxTotalTime) newTime = maxTotalTime;
      const achieved_percentage = Math.round((newTime / maxTotalTime) * 100);
      const newStatus = (newTime >= min_time_per_slide * slideCount) ? 'complete' : status;
      await pool.query(
        `UPDATE slide_watch_aggregates 
         SET last_stop_time = $1, total_watch_time = $2, updated_at = NOW()
         WHERE user_id = $3 AND slide_lesson_id = $4`,
        [last_stop_time, newTime, user_id, slide_lesson_id]
      );
      // Optionally, cập nhật achieved_percentage vào một cột nếu có
      await pool.query(
        `UPDATE slidelessons
         SET achieved_percentage = $1
         WHERE slide_lesson_id = $2`,
        [achieved_percentage, slide_lesson_id]
      );
    } else {
      let initialTime = additional_watch_time;
      if (initialTime > maxTotalTime) initialTime = maxTotalTime;
      const achieved_percentage = Math.round((initialTime / maxTotalTime) * 100);
      const newStatus = (initialTime >= min_time_per_slide * slideCount) ? 'complete' : status;
      await pool.query(
        `INSERT INTO slide_watch_aggregates (user_id, slide_lesson_id, last_stop_time, total_watch_time, status)
         VALUES ($1, $2, $3, $4, $5)`,
        [user_id, slide_lesson_id, last_stop_time, initialTime, newStatus]
      );
      await pool.query(
        `UPDATE slidelessons
         SET achieved_percentage = $1
         WHERE slide_lesson_id = $2`,
        [achieved_percentage, slide_lesson_id]
      );
    }
    res.json({ message: 'Slide aggregate updated' });
  } catch (error) {
    console.error('Update slide aggregate error:', error);
    res.status(500).json({ error: 'Failed to update slide aggregate' });
  }
};

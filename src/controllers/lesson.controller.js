// src/controllers/lesson.controller.js
const pool = require('../config/db');

exports.getLessonsByCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM lessons WHERE course_id = $1 ORDER BY created_at ASC',
      [courseId]
    );
    res.json({ lessons: result.rows });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};

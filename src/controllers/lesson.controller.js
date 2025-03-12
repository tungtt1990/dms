// src/controllers/lesson.controller.js
const pool = require('../config/db');

exports.getLessonsBySubjectAndType = async (req, res) => {
  const { subjectId, type } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM lessons WHERE subject_id = $1 and type = $2 ORDER BY created_at ASC',
      [subjectId, type] 
    );
    res.json({ lessons: result.rows });
  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};

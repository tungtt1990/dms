// src/controllers/exam.controller.js
const pool = require('../config/db');

exports.getExamsByCourse = async (req, res) => {
  const { courseId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM exams WHERE course_id = $1 ORDER BY created_at DESC', [courseId]);
    res.json({ exams: result.rows });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

exports.recordTestSession = async (req, res) => {
  const { exam_id, start_time, end_time, score, status, answers } = req.body;
  const user_id = req.user.user_id;
  try {
    await pool.query(
      `INSERT INTO test_sessions (user_id, exam_id, start_time, end_time, score, status, answers)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [user_id, exam_id, start_time, end_time, score, status, JSON.stringify(answers)]
    );
    res.json({ message: 'Test session recorded' });
  } catch (error) {
    console.error('Record test session error:', error);
    res.status(500).json({ error: 'Failed to record test session' });
  }
};

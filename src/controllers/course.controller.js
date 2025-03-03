// src/controllers/course.controller.js
const pool = require('../config/db');

exports.getAllCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.enrollCourse = async (req, res) => {
  const { courseId } = req.params;
  const studentId = req.user.user_id;
  try {
    const check = await pool.query(
      'SELECT * FROM course_enrollments WHERE course_id = $1 AND student_id = $2',
      [courseId, studentId]
    );
    if (check.rows.length > 0) return res.status(400).json({ message: 'Already enrolled' });
    await pool.query('INSERT INTO course_enrollments (course_id, student_id) VALUES ($1, $2)', [courseId, studentId]);
    res.json({ message: 'Enrollment successful' });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ error: 'Enrollment failed' });
  }
};

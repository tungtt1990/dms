// src/controllers/admin.exam.controller.js
const pool = require('../config/db');

// Lấy danh sách tất cả kỳ thi
exports.getAllExams = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exams ORDER BY created_at DESC');
    res.json({ exams: result.rows });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Failed to fetch exams' });
  }
};

// Lấy chi tiết kỳ thi theo ID
exports.getExamById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM exams WHERE exam_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json({ exam: result.rows[0] });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ error: 'Failed to fetch exam' });
  }
};

// Tạo kỳ thi mới
exports.createExam = async (req, res) => {
  const { course_id, exam_title, duration } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO exams (course_id, exam_title, duration)
       VALUES ($1, $2, $3) RETURNING exam_id`,
      [course_id, exam_title, duration]
    );
    res.status(201).json({ message: 'Exam created', exam_id: result.rows[0].exam_id });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Failed to create exam' });
  }
};

// Cập nhật kỳ thi
exports.updateExam = async (req, res) => {
  const { id } = req.params;
  const { exam_title, duration } = req.body;
  try {
    const result = await pool.query(
      `UPDATE exams SET exam_title = $1, duration = $2, updated_at = NOW()
       WHERE exam_id = $3 RETURNING *`,
      [exam_title, duration, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json({ message: 'Exam updated', exam: result.rows[0] });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Failed to update exam' });
  }
};

// Xóa kỳ thi
exports.deleteExam = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM exams WHERE exam_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json({ message: 'Exam deleted', exam: result.rows[0] });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: 'Failed to delete exam' });
  }
};

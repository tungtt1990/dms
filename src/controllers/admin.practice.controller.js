// src/controllers/admin.practice.controller.js
const pool = require('../config/db');

// Lấy danh sách tất cả bài tập thực hành
exports.getAllExercises = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM practice_exercises WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json({ exercises: result.rows });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
};

// Lấy thông tin bài tập theo ID
exports.getExerciseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM practice_exercises WHERE exercise_id = $1 AND deleted_at IS NULL', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ exercise: result.rows[0] });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
};

// Tạo bài tập mới
exports.createExercise = async (req, res) => {
  // Expect body: course_id, title, description, time_limit, total_questions (các thông tin của bài tập)
  const { course_id, title, description, time_limit, total_questions } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO practice_exercises (course_id, title, description, time_limit, total_questions)
       VALUES ($1, $2, $3, $4, $5) RETURNING exercise_id`,
      [course_id, title, description, time_limit, total_questions]
    );
    res.status(201).json({ message: 'Exercise created', exercise_id: result.rows[0].exercise_id });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
};

// Cập nhật bài tập
exports.updateExercise = async (req, res) => {
  const { id } = req.params;
  const { title, description, time_limit, total_questions } = req.body;
  try {
    const result = await pool.query(
      `UPDATE practice_exercises 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           time_limit = COALESCE($3, time_limit),
           total_questions = COALESCE($4, total_questions),
           updated_at = NOW()
       WHERE exercise_id = $5 AND deleted_at IS NULL
       RETURNING *`,
      [title, description, time_limit, total_questions, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'Exercise updated', exercise: result.rows[0] });
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Failed to update exercise' });
  }
};

// Xóa bài tập (soft delete)
exports.deleteExercise = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE practice_exercises SET deleted_at = NOW() WHERE exercise_id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'Exercise deleted', exercise: result.rows[0] });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
};

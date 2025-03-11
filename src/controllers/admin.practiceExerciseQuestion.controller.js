// src/controllers/admin.practiceExerciseQuestion.controller.js
const pool = require('../config/db');

exports.createMultiplePracticeExerciseQuestions = async (req, res) => {
  // Expect body: { exercise_id: Number, questions: [{ question_id, order_index, marks }] }
  const { exercise_id, questions } = req.body;

  if (!exercise_id || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Invalid payload. exercise_id and non-empty questions array are required.' });
  }

  try {
    await pool.query('BEGIN');
    // Tạo query insert dạng bulk insert
    const insertValues = [];
    const params = [];
    let paramIndex = 1;
    questions.forEach(q => {
      insertValues.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      params.push(exercise_id, q.question_id, q.order_index, q.marks || 0);
    });
    const query = `
      INSERT INTO practice_exercise_questions 
      (exercise_id, question_id, order_index, marks)
      VALUES ${insertValues.join(', ')}
    `;
    await pool.query(query, params);
    await pool.query('COMMIT');
    res.status(201).json({ message: 'Practice exercise questions added successfully' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error inserting practice exercise questions:', error);
    res.status(500).json({ error: 'Failed to add practice exercise questions' });
  }
};

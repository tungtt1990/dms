const pool = require('../config/db');

exports.getAllExercises = async (req, res) => {
  try {
    const { subject_id, title, page = 1, limit = 20, sort_by = 'created_at', sort_order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['pe.deleted_at IS NULL'];
    const params = [];
    let idx = 1;
    if (subject_id) {
      conditions.push(`pe.subject_id = $${idx++}`);
      params.push(subject_id);
    }
    if (title) {
      conditions.push(`pe.title ILIKE $${idx++}`);
      params.push(`%${title}%`);
    }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT pe.*, s.subject_name, s.description AS subject_description
      FROM practice_exercises pe
      LEFT JOIN subjects s ON pe.subject_id = s.subject_id
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json({ exercises: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
};

exports.getExerciseById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT pe.*, s.subject_name, s.description AS subject_description
      FROM practice_exercises pe
      LEFT JOIN subjects s ON pe.subject_id = s.subject_id
      WHERE pe.exercise_id = $1 AND pe.deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Exercise not found' });
    res.json({ exercise: result.rows[0] });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
};

exports.createExercise = async (req, res) => {
  const { subject_id, title, description, time_limit, total_questions } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO practice_exercises (subject_id, title, description, time_limit, total_questions)
       VALUES ($1, $2, $3, $4, $5) RETURNING exercise_id`,
      [subject_id, title, description, time_limit, total_questions]
    );
    res.status(201).json({ message: 'Exercise created', exercise_id: result.rows[0].exercise_id });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
};

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
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'Exercise updated', exercise: result.rows[0] });
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Failed to update exercise' });
  }
};

exports.deleteExercise = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE practice_exercises SET deleted_at = NOW() WHERE exercise_id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'Exercise deleted', exercise: result.rows[0] });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
};

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

module.exports = exports;

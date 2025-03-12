const pool = require('../config/db');

exports.getAllPracticeSessions = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort_by = 'created_at', sort_order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT * FROM practice_sessions 
       WHERE deleted_at IS NULL
       ORDER BY ${sort_by} ${sort_order}
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    res.json({ practice_sessions: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching practice sessions:', error);
    res.status(500).json({ error: 'Failed to fetch practice sessions' });
  }
};

exports.getPracticeSessionById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM practice_sessions WHERE session_id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Practice session not found' });
    res.json({ practice_session: result.rows[0] });
  } catch (error) {
    console.error('Error fetching practice session:', error);
    res.status(500).json({ error: 'Failed to fetch practice session' });
  }
};

exports.createPracticeSession = async (req, res) => {
  const { exercise_id, user_id, start_time, end_time, answers, score, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO practice_sessions (exercise_id, user_id, start_time, end_time, answers, score, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING session_id`,
      [exercise_id, user_id, start_time, end_time, JSON.stringify(answers), score, status]
    );
    res.status(201).json({ message: 'Practice session created', session_id: result.rows[0].session_id });
  } catch (error) {
    console.error('Error creating practice session:', error);
    res.status(500).json({ error: 'Failed to create practice session' });
  }
};

exports.updatePracticeSession = async (req, res) => {
  const { id } = req.params;
  const { exercise_id, user_id, start_time, end_time, answers, score, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE practice_sessions 
       SET exercise_id = COALESCE($1, exercise_id),
           user_id = COALESCE($2, user_id),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           answers = COALESCE($5, answers),
           score = COALESCE($6, score),
           status = COALESCE($7, status),
           updated_at = NOW()
       WHERE session_id = $8 AND deleted_at IS NULL RETURNING *`,
      [exercise_id, user_id, start_time, end_time, JSON.stringify(answers), score, status, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Practice session not found' });
    res.json({ message: 'Practice session updated', practice_session: result.rows[0] });
  } catch (error) {
    console.error('Error updating practice session:', error);
    res.status(500).json({ error: 'Failed to update practice session' });
  }
};

exports.deletePracticeSession = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE practice_sessions SET deleted_at = NOW() 
       WHERE session_id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Practice session not found' });
    res.json({ message: 'Practice session deleted', practice_session: result.rows[0] });
  } catch (error) {
    console.error('Error deleting practice session:', error);
    res.status(500).json({ error: 'Failed to delete practice session' });
  }
};

module.exports = exports;

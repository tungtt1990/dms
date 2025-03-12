const pool = require('../config/db');

exports.getAllQuestions = async (req, res) => {
  try {
    const { content, page = 1, limit = 20, sort_by = 'created_at', sort_order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['q.deleted_at IS NULL'];
    const params = [];
    let idx = 1;
    if (content) {
      conditions.push(`q.content ILIKE $${idx++}`);
      params.push(`%${content}%`);
    }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT q.question_id, q.subject_id, q.content, q.image_url, q.explanation, q.explanation_image_url, q.difficulty_level, q.created_at,
             json_agg(json_build_object(
                'answer_id', a.answer_id,
                'content', a.content,
                'image_url', a.image_url,
                'is_correct', a.is_correct,
                'order_index', a.order_index
             ) ORDER BY a.order_index) as answers
      FROM questions q
      LEFT JOIN answers a ON q.question_id = a.question_id AND a.deleted_at IS NULL
      ${whereClause}
      GROUP BY q.question_id
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json({ questions: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

exports.getQuestionById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT q.question_id, q.subject_id, q.content, q.image_url, q.explanation, q.explanation_image_url, q.difficulty_level, q.created_at,
             json_agg(json_build_object(
                'answer_id', a.answer_id,
                'content', a.content,
                'image_url', a.image_url,
                'is_correct', a.is_correct,
                'order_index', a.order_index
             ) ORDER BY a.order_index) as answers
      FROM questions q
      LEFT JOIN answers a ON q.question_id = a.question_id AND a.deleted_at IS NULL
      WHERE q.question_id = $1 AND q.deleted_at IS NULL
      GROUP BY q.question_id
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Question not found' });
    res.json({ question: result.rows[0] });
  } catch (error) {
    console.error('Error fetching question by id:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};

exports.createQuestion = async (req, res) => {
  const { subject_id, content, image_url, explanation, explanation_image_url, difficulty_level, answers } = req.body;
  try {
    await pool.query('BEGIN');
    const result = await pool.query(
      `INSERT INTO questions (subject_id, content, image_url, explanation, explanation_image_url, difficulty_level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING question_id`,
      [subject_id, content, image_url, explanation, explanation_image_url, difficulty_level]
    );
    const question_id = result.rows[0].question_id;
    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        await pool.query(
          `INSERT INTO answers (question_id, content, image_url, is_correct, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [question_id, answer.content, answer.image_url, answer.is_correct, answer.order_index]
        );
      }
    }
    await pool.query('COMMIT');
    res.status(201).json({ message: 'Question created', question_id });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { content, image_url, explanation, explanation_image_url, difficulty_level, answers } = req.body;
  try {
    await pool.query('BEGIN');
    const result = await pool.query(
      `UPDATE questions
       SET content = COALESCE($1, content),
           image_url = COALESCE($2, image_url),
           explanation = COALESCE($3, explanation),
           explanation_image_url = COALESCE($4, explanation_image_url),
           difficulty_level = COALESCE($5, difficulty_level),
           updated_at = NOW()
       WHERE question_id = $6 AND deleted_at IS NULL RETURNING question_id`,
      [content, image_url, explanation, explanation_image_url, difficulty_level, id]
    );
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Question not found' });
    }
    if (answers && Array.isArray(answers)) {
      await pool.query('DELETE FROM answers WHERE question_id = $1', [id]);
      for (const answer of answers) {
        await pool.query(
          `INSERT INTO answers (question_id, content, image_url, is_correct, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, answer.content, answer.image_url, answer.is_correct, answer.order_index]
        );
      }
    }
    await pool.query('COMMIT');
    res.json({ message: 'Question updated', question_id: id });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE questions SET deleted_at = NOW() WHERE question_id = $1 AND deleted_at IS NULL RETURNING question_id, content',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Question deleted', question: result.rows[0] });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

module.exports = exports;

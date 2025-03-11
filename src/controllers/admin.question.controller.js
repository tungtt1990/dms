// src/controllers/admin.question.controller.js
const pool = require('../config/db');

// Lấy tất cả câu hỏi với danh sách đáp án (sử dụng json_agg để gom nhóm đáp án)
exports.getAllQuestions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.question_id, q.bank_id, q.content, q.image_url, q.explanation, q.explanation_image_url, q.difficulty_level, q.created_at,
             json_agg(json_build_object(
                'answer_id', a.answer_id,
                'content', a.content,
                'image_url', a.image_url,
                'is_correct', a.is_correct,
                'order_index', a.order_index
             ) ORDER BY a.order_index) as answers
      FROM questions q
      LEFT JOIN answers a ON q.question_id = a.question_id
      GROUP BY q.question_id
      ORDER BY q.created_at DESC
    `);
    res.json({ questions: result.rows });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Lấy chi tiết một câu hỏi theo ID, bao gồm danh sách đáp án
exports.getQuestionById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT q.question_id, q.bank_id, q.content, q.image_url, q.explanation, q.explanation_image_url, q.difficulty_level, q.created_at,
             json_agg(json_build_object(
                'answer_id', a.answer_id,
                'content', a.content,
                'image_url', a.image_url,
                'is_correct', a.is_correct,
                'order_index', a.order_index
             ) ORDER BY a.order_index) as answers
      FROM questions q
      LEFT JOIN answers a ON q.question_id = a.question_id
      WHERE q.question_id = $1
      GROUP BY q.question_id
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json({ question: result.rows[0] });
  } catch (error) {
    console.error('Error fetching question by id:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};

// Tạo câu hỏi mới kèm theo mảng đáp án
exports.createQuestion = async (req, res) => {
  // Expect body: bank_id, content, image_url, explanation, explanation_image_url, difficulty_level, answers (array)
  const { bank_id, content, image_url, explanation, explanation_image_url, difficulty_level, answers } = req.body;
  try {
    await pool.query('BEGIN');
    const result = await pool.query(`
      INSERT INTO questions (bank_id, content, image_url, explanation, explanation_image_url, difficulty_level)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING question_id
    `, [bank_id, content, image_url, explanation, explanation_image_url, difficulty_level]);
    const question_id = result.rows[0].question_id;

    if (answers && Array.isArray(answers)) {
      for (const answer of answers) {
        await pool.query(`
          INSERT INTO answers (question_id, content, image_url, is_correct, order_index)
          VALUES ($1, $2, $3, $4, $5)
        `, [question_id, answer.content, answer.image_url, answer.is_correct, answer.order_index]);
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

// Cập nhật câu hỏi và cập nhật lại đáp án nếu được cung cấp
exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  const { content, image_url, explanation, explanation_image_url, difficulty_level, answers } = req.body;
  try {
    await pool.query('BEGIN');
    const result = await pool.query(`
      UPDATE questions
      SET content = COALESCE($1, content),
          image_url = COALESCE($2, image_url),
          explanation = COALESCE($3, explanation),
          explanation_image_url = COALESCE($4, explanation_image_url),
          difficulty_level = COALESCE($5, difficulty_level),
          updated_at = NOW()
      WHERE question_id = $6 RETURNING question_id
    `, [content, image_url, explanation, explanation_image_url, difficulty_level, id]);
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Question not found' });
    }
    // Nếu có mảng đáp án được cung cấp, xóa các đáp án cũ và chèn lại mới
    if (answers && Array.isArray(answers)) {
      await pool.query('UPDATE answers deleted_at = NOW() WHERE question_id = $1', [id]);
      for (const answer of answers) {
        await pool.query(`
          INSERT INTO answers (question_id, content, image_url, is_correct, order_index)
          VALUES ($1, $2, $3, $4, $5)
        `, [id, answer.content, answer.image_url, answer.is_correct, answer.order_index]);
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

// Xóa câu hỏi (với đáp án sẽ tự động bị xóa theo cascade)
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('UPDATE questions SET deleted_at = NOW() WHERE question_id = $1 RETURNING question_id, content', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Question not found' });
    res.json({ message: 'Question deleted', question: result.rows[0] });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

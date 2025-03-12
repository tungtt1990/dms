const pool = require('../config/db');

exports.getAllTestPapers = async (req, res) => {
  try {
    const { paper_type, page = 1, limit = 20, sort_by = 'created_at', sort_order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['tp.deleted_at IS NULL'];
    const params = [];
    let idx = 1;
    if (paper_type) {
      conditions.push(`tp.paper_type = $${idx++}`);
      params.push(paper_type);
    }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT tp.*, s.subject_name, s.description as subject_description
      FROM test_papers tp
      LEFT JOIN subjects s ON tp.subject_id = s.subject_id
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json({ test_papers: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching test papers:', error);
    res.status(500).json({ error: 'Failed to fetch test papers' });
  }
};

exports.getTestPaperById = async (req, res) => {
  const { id } = req.params;
  try {
    const paperQuery = `
      SELECT tp.*, s.subject_name, s.description as subject_description
      FROM test_papers tp
      LEFT JOIN subjects s ON tp.subject_id = s.subject_id
      WHERE tp.exam_paper_id = $1 AND tp.deleted_at IS NULL
    `;
    const paperResult = await pool.query(paperQuery, [id]);
    if (paperResult.rows.length === 0)
      return res.status(404).json({ error: 'Test paper not found' });
    
    const questionsResult = await pool.query(`
      SELECT epq.id, q.question_id, q.content, q.image_url, epq.order_index, epq.marks
      FROM exam_paper_questions epq
      JOIN questions q ON epq.question_id = q.question_id
      WHERE epq.exam_paper_id = $1 AND epq.deleted_at IS NULL
      ORDER BY epq.order_index ASC
    `, [id]);
    res.json({ test_paper: paperResult.rows[0], questions: questionsResult.rows });
  } catch (error) {
    console.error('Error fetching test paper by id:', error);
    res.status(500).json({ error: 'Failed to fetch test paper' });
  }
};

exports.createTestPaper = async (req, res) => {
  const { teacher_id, subject_id, title, description, duration, paper_type, time_limit, question_ids } = req.body;
  try {
    await pool.query('BEGIN');
    const result = await pool.query(
      `INSERT INTO test_papers (teacher_id, subject_id, title, description, duration, paper_type, time_limit)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING exam_paper_id`,
      [teacher_id, subject_id, title, description, duration, paper_type, time_limit]
    );
    const exam_paper_id = result.rows[0].exam_paper_id;
    if (question_ids && Array.isArray(question_ids)) {
      for (let i = 0; i < question_ids.length; i++) {
        await pool.query(
          `INSERT INTO exam_paper_questions (exam_paper_id, question_id, order_index, marks)
           VALUES ($1, $2, $3, $4)`,
          [exam_paper_id, question_ids[i], i + 1, 10]
        );
      }
    }
    await pool.query('COMMIT');
    res.status(201).json({ message: 'Test paper created', exam_paper_id });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating test paper:', error);
    res.status(500).json({ error: 'Failed to create test paper' });
  }
};

exports.updateTestPaper = async (req, res) => {
  const { id } = req.params;
  const { title, description, duration, paper_type, time_limit, question_ids } = req.body;
  try {
    await pool.query('BEGIN');
    const result = await pool.query(
      `UPDATE test_papers
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           duration = COALESCE($3, duration),
           paper_type = COALESCE($4, paper_type),
           time_limit = COALESCE($5, time_limit),
           updated_at = NOW()
       WHERE exam_paper_id = $6 AND deleted_at IS NULL RETURNING exam_paper_id`,
      [title, description, duration, paper_type, time_limit, id]
    );
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Test paper not found' });
    }
    if (question_ids && Array.isArray(question_ids)) {
      await pool.query('DELETE FROM exam_paper_questions WHERE exam_paper_id = $1', [id]);
      for (let i = 0; i < question_ids.length; i++) {
        await pool.query(
          `INSERT INTO exam_paper_questions (exam_paper_id, question_id, order_index, marks)
           VALUES ($1, $2, $3, $4)`,
          [id, question_ids[i], i + 1, 10]
        );
      }
    }
    await pool.query('COMMIT');
    res.json({ message: 'Test paper updated', exam_paper_id: id });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error updating test paper:', error);
    res.status(500).json({ error: 'Failed to update test paper' });
  }
};

exports.deleteTestPaper = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE test_papers SET deleted_at = NOW() WHERE exam_paper_id = $1 AND deleted_at IS NULL RETURNING exam_paper_id, title',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Test paper not found' });
    res.json({ message: 'Test paper deleted', test_paper: result.rows[0] });
  } catch (error) {
    console.error('Error deleting test paper:', error);
    res.status(500).json({ error: 'Failed to delete test paper' });
  }
};

exports.getRandomTestPaper = async (req, res) => {
  const { paper_type } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM test_papers 
       WHERE paper_type = $1 AND deleted_at IS NULL
       ORDER BY RANDOM() LIMIT 1`,
      [paper_type]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'No test paper found for the specified type' });
    res.json({ test_paper: result.rows[0] });
  } catch (error) {
    console.error('Error fetching random test paper:', error);
    res.status(500).json({ error: 'Failed to fetch random test paper' });
  }
};

module.exports = exports;


// src/controllers/admin.testpaper.controller.js
const pool = require('../config/db');

// Lấy danh sách tất cả test papers
exports.getAllTestPapers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM test_papers ORDER BY created_at DESC');
    res.json({ test_papers: result.rows });
  } catch (error) {
    console.error('Error fetching test papers:', error);
    res.status(500).json({ error: 'Failed to fetch test papers' });
  }
};

// Lấy test paper theo ID, bao gồm danh sách câu hỏi của đề thi
exports.getTestPaperById = async (req, res) => {
  const { id } = req.params;
  try {
    const paperResult = await pool.query('SELECT * FROM test_papers WHERE exam_paper_id = $1', [id]);
    if (paperResult.rows.length === 0) return res.status(404).json({ error: 'Test paper not found' });
    
    const questionsResult = await pool.query(`
      SELECT epq.id, q.question_id, q.content, q.image_url, epq.order_index, epq.marks
      FROM exam_paper_questions epq
      JOIN questions q ON epq.question_id = q.question_id
      WHERE epq.exam_paper_id = $1
      ORDER BY epq.order_index ASC
    `, [id]);
    
    res.json({ test_paper: paperResult.rows[0], questions: questionsResult.rows });
  } catch (error) {
    console.error('Error fetching test paper by id:', error);
    res.status(500).json({ error: 'Failed to fetch test paper' });
  }
};

// Tạo test paper mới
exports.createTestPaper = async (req, res) => {
  // Expect body: teacher_id, title, description, duration, question_ids (array)
  const { teacher_id, title, description, duration, question_ids } = req.body;
  try {
    await pool.query('BEGIN');
    const result = await pool.query(`
      INSERT INTO test_papers (teacher_id, title, description, duration)
      VALUES ($1, $2, $3, $4) RETURNING exam_paper_id
    `, [teacher_id, title, description, duration]);
    const exam_paper_id = result.rows[0].exam_paper_id;
    if (question_ids && Array.isArray(question_ids)) {
      for (let i = 0; i < question_ids.length; i++) {
        await pool.query(`
          INSERT INTO exam_paper_questions (exam_paper_id, question_id, order_index, marks)
          VALUES ($1, $2, $3, $4)
        `, [exam_paper_id, question_ids[i], i + 1, 10]); // Giả sử mỗi câu có 10 điểm
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

// Cập nhật test paper
exports.updateTestPaper = async (req, res) => {
  const { id } = req.params;
  const { title, description, duration, question_ids } = req.body;
  try {
    await pool.query('BEGIN');
    const result = await pool.query(`
      UPDATE test_papers
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          duration = COALESCE($3, duration),
          updated_at = NOW()
      WHERE exam_paper_id = $4 RETURNING exam_paper_id
    `, [title, description, duration, id]);
    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Test paper not found' });
    }
    // Cập nhật danh sách câu hỏi nếu có
    if (question_ids && Array.isArray(question_ids)) {
      await pool.query('DELETE FROM exam_paper_questions WHERE exam_paper_id = $1', [id]);
      for (let i = 0; i < question_ids.length; i++) {
        await pool.query(`
          INSERT INTO exam_paper_questions (exam_paper_id, question_id, order_index, marks)
          VALUES ($1, $2, $3, $4)
        `, [id, question_ids[i], i + 1, 10]);
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

// Xóa test paper
exports.deleteTestPaper = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM test_papers WHERE exam_paper_id = $1 RETURNING exam_paper_id, title', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Test paper not found' });
    res.json({ message: 'Test paper deleted', test_paper: result.rows[0] });
  } catch (error) {
    console.error('Error deleting test paper:', error);
    res.status(500).json({ error: 'Failed to delete test paper' });
  }
};

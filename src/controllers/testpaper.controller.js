// src/controllers/testpaper.controller.js
const pool = require('../config/db');

exports.createTestPaper = async (req, res) => {
  const { title, description, duration, question_ids } = req.body;
  // Giả sử req.user có role 'teacher'
  const teacher_id = req.user.user_id;
  try {
    const result = await pool.query(
      `INSERT INTO test_papers (teacher_id, title, description, duration)
       VALUES ($1, $2, $3, $4) RETURNING exam_paper_id`,
      [teacher_id, title, description, duration]
    );
    const exam_paper_id = result.rows[0].exam_paper_id;
    // Chèn danh sách câu hỏi vào exam_paper_questions
    for (const [index, qid] of question_ids.entries()) {
      await pool.query(
        `INSERT INTO exam_paper_questions (exam_paper_id, question_id, order_index)
         VALUES ($1, $2, $3)`,
        [exam_paper_id, qid, index + 1]
      );
    }
    res.status(201).json({ message: 'Test paper created', exam_paper_id });
  } catch (error) {
    console.error('Create test paper error:', error);
    res.status(500).json({ error: 'Failed to create test paper' });
  }
};

exports.getTestPapersByTeacher = async (req, res) => {
  const teacher_id = req.user.user_id;
  try {
    const result = await pool.query(
      'SELECT * FROM test_papers WHERE teacher_id = $1 ORDER BY created_at DESC',
      [teacher_id]
    );
    res.json({ test_papers: result.rows });
  } catch (error) {
    console.error('Get test papers error:', error);
    res.status(500).json({ error: 'Failed to fetch test papers' });
  }
};

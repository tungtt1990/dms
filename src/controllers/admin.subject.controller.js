const pool = require('../config/db');

exports.getAllSubjects = async (req, res) => {
  try {
    const { subject_name, sort_by = 'created_at', sort_order = 'DESC', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['deleted_at IS NULL'];
    const params = [];
    let idx = 1;
    if (subject_name) {
      conditions.push(`subject_name ILIKE $${idx++}`);
      params.push(`%${subject_name}%`);
    }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT * FROM subjects
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json({ subjects: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

exports.getSubjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM subjects WHERE subject_id = $1 AND deleted_at IS NULL',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Subject not found' });
    res.json({ subject: result.rows[0] });
  } catch (error) {
    console.error('Error fetching subject:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
};

exports.createSubject = async (req, res) => {
  const { subject_name, description } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO subjects (subject_name, description)
       VALUES ($1, $2) RETURNING subject_id`,
      [subject_name, description]
    );
    res.status(201).json({ message: 'Subject created', subject_id: result.rows[0].subject_id });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

exports.updateSubject = async (req, res) => {
  const { id } = req.params;
  const { subject_name, description } = req.body;
  try {
    const result = await pool.query(
      `UPDATE subjects
       SET subject_name = COALESCE($1, subject_name),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE subject_id = $3 AND deleted_at IS NULL
       RETURNING *`,
      [subject_name, description, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Subject not found' });
    res.json({ message: 'Subject updated', subject: result.rows[0] });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

exports.deleteSubject = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE subjects SET deleted_at = NOW() WHERE subject_id = $1 AND deleted_at IS NULL RETURNING *`,
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Subject not found' });
    res.json({ message: 'Subject deleted', subject: result.rows[0] });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

module.exports = exports;

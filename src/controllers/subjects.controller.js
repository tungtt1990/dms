const pool = require('../config/db');

exports.getAllSubjects = async (req, res) => {
  try {
    const { subject_name, sort_by = 'subject_id', sort_order = 'ASC' } = req.query;
    const conditions = ['deleted_at IS NULL'];
    const params = [];
    let idx = 1;
    if (subject_name) {
      conditions.push(`subject_name ILIKE $${idx++}`);
      params.push(`%${subject_name}%`);
    }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT subject_id, subject_name, description FROM subjects
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
    `;
    const result = await pool.query(query, params);
    res.json({ subjects: result.rows});
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

module.exports = exports;
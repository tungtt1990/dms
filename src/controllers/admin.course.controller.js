const pool = require('../config/db');

exports.getAllCourses = async (req, res) => {
  try {
    const { course_rank, sort_by = 'created_at', sort_order = 'DESC', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['deleted_at IS NULL'];
    const params = [];
    let idx = 1;
    if (course_rank) {
      conditions.push(`course_rank = $${idx++}`);
      params.push(course_rank);
    }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    // Nếu courses có subject_id, JOIN với subjects để lấy subject_name và description
    const query = `
      SELECT c.*, s.subject_name, s.description as subject_description
      FROM courses c
      LEFT JOIN subjects s ON c.subject_id = s.subject_id
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json({ courses: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT c.*, s.subject_name, s.description as subject_description
      FROM courses c
      LEFT JOIN subjects s ON c.subject_id = s.subject_id
      WHERE c.course_id = $1 AND c.deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Course not found' });
    res.json({ course: result.rows[0] });
  } catch (error) {
    console.error('Error fetching course by id:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

exports.createCourse = async (req, res) => {
  const { course_name, description, start_date, end_date, course_rank, subject_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO courses (course_name, description, start_date, end_date, course_rank, subject_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING course_id`,
      [course_name, description, start_date, end_date, course_rank, subject_id]
    );
    res.status(201).json({ message: 'Course created', course_id: result.rows[0].course_id });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { course_name, description, start_date, end_date, course_rank, subject_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE courses SET course_name = COALESCE($1, course_name),
                           description = COALESCE($2, description),
                           start_date = COALESCE($3, start_date),
                           end_date = COALESCE($4, end_date),
                           course_rank = COALESCE($5, course_rank),
                           subject_id = COALESCE($6, subject_id),
                           updated_at = NOW()
       WHERE course_id = $7 AND deleted_at IS NULL RETURNING *`,
      [course_name, description, start_date, end_date, course_rank, subject_id, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course updated', course: result.rows[0] });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE courses SET deleted_at = NOW() WHERE course_id = $1 AND deleted_at IS NULL RETURNING *',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted', course: result.rows[0] });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

module.exports = exports;

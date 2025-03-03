// src/controllers/admin.course.controller.js
const pool = require('../config/db');

// Lấy tất cả khóa học
exports.getAllCourses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json({ courses: result.rows });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

// Lấy thông tin chi tiết khóa học theo ID
exports.getCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM courses WHERE course_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ course: result.rows[0] });
  } catch (error) {
    console.error('Error fetching course by id:', error);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

// Tạo mới khóa học
exports.createCourse = async (req, res) => {
  const { course_name, description, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO courses (course_name, description, start_date, end_date)
       VALUES ($1, $2, $3, $4) RETURNING course_id`,
      [course_name, description, start_date, end_date]
    );
    res.status(201).json({ message: 'Course created', course_id: result.rows[0].course_id });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

// Cập nhật khóa học
exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { course_name, description, start_date, end_date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE courses 
       SET course_name = $1, description = $2, start_date = $3, end_date = $4, updated_at = NOW()
       WHERE course_id = $5 RETURNING *`,
      [course_name, description, start_date, end_date, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course updated', course: result.rows[0] });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

// Xóa khóa học
exports.deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM courses WHERE course_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Course not found' });
    res.json({ message: 'Course deleted', course: result.rows[0] });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};

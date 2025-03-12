const pool = require('../config/db');

exports.getAllLessons = async (req, res) => {
  try {
    const { type, subject_id, sort_by = 'created_at', sort_order = 'ASC', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const conditions = ['l.deleted_at IS NULL'];
    const params = [];
    let idx = 1;
    if (type) {
      conditions.push(`l.type = $${idx++}`);
      params.push(type);
    }
    if (subject_id) {
      conditions.push(`l.subject_id = $${idx++}`);
      params.push(subject_id);
    }
    const whereClause = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT l.*, s.subject_name, s.description AS subject_description
      FROM lessons l
      LEFT JOIN subjects s ON l.subject_id = s.subject_id
      ${whereClause}
      ORDER BY ${sort_by} ${sort_order}
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);
    const result = await pool.query(query, params);
    res.json({ lessons: result.rows, page: Number(page), limit: Number(limit) });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};

exports.getLessonById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT l.*, s.subject_name, s.description AS subject_description
      FROM lessons l
      LEFT JOIN subjects s ON l.subject_id = s.subject_id
      WHERE l.lesson_id = $1 AND l.deleted_at IS NULL
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lesson not found' });
    res.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
};

exports.createLesson = async (req, res) => {
  // Input: course_id, subject_id, title, description, type.
  // Nếu type là 'video', cần thêm các trường: video_url, duration, file_size, format, min_required_time, segments (array)
  // Nếu type là 'slideshow', cần các trường: total_time, slide_count, min_time_per_slide
  const { course_id, subject_id, title, description, type } = req.body;
  try {
    await pool.query('BEGIN');
    const lessonResult = await pool.query(
      `INSERT INTO lessons (course_id, subject_id, title, description, type)
       VALUES ($1, $2, $3, $4, $5) RETURNING lesson_id`,
      [course_id, subject_id, title, description, type]
    );
    const lesson_id = lessonResult.rows[0].lesson_id;
    if (type === 'video') {
      const { video_url, duration, file_size, format, min_required_time, segments } = req.body;
      const videoResult = await pool.query(
        `INSERT INTO videolessons (lesson_id, video_url, duration, file_size, format, min_required_time)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING video_lesson_id`,
        [lesson_id, video_url, duration, file_size, format, min_required_time]
      );
      const video_lesson_id = videoResult.rows[0].video_lesson_id;
      if (segments && Array.isArray(segments)) {
        for (const segment of segments) {
          await pool.query(
            `INSERT INTO video_segments (video_lesson_id, title, summary, start_time, end_time)
             VALUES ($1, $2, $3, $4, $5)`,
            [video_lesson_id, segment.title, segment.summary, segment.start_time, segment.end_time]
          );
        }
      }
    } else if (type === 'slideshow') {
      const { total_time, slide_count, min_time_per_slide } = req.body;
      await pool.query(
        `INSERT INTO slidelessons (lesson_id, total_time, slide_count, min_time_per_slide)
         VALUES ($1, $2, $3, $4)`,
        [lesson_id, total_time, slide_count, min_time_per_slide]
      );
    }
    await pool.query('COMMIT');
    res.status(201).json({ message: 'Lesson created', lesson_id });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
};

exports.updateLesson = async (req, res) => {
  const { id } = req.params;
  const { title, description, type } = req.body;
  try {
    const result = await pool.query(
      `UPDATE lessons SET title = COALESCE($1, title),
                           description = COALESCE($2, description),
                           type = COALESCE($3, type),
                           updated_at = NOW()
       WHERE lesson_id = $4 AND deleted_at IS NULL RETURNING *`,
      [title, description, type, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lesson not found' });
    res.json({ message: 'Lesson updated', lesson: result.rows[0] });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
};

exports.deleteLesson = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE lessons SET deleted_at = NOW() WHERE lesson_id = $1 AND deleted_at IS NULL RETURNING *',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lesson not found' });
    res.json({ message: 'Lesson deleted', lesson: result.rows[0] });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
};

module.exports = exports;

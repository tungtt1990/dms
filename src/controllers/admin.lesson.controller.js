// src/controllers/admin.lesson.controller.js
const pool = require('../config/db');

// Lấy danh sách tất cả bài giảng
exports.getAllLessons = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lessons ORDER BY created_at ASC');
    res.json({ lessons: result.rows });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};

// Lấy bài giảng theo ID
exports.getLessonById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM lessons WHERE lesson_id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
};

// Tạo bài giảng mới (có thể là video hoặc slideshow)
// Nếu type là "video": body request cần chứa video_url, duration, file_size, format và tùy chọn segments (mảng)
// Nếu type là "slideshow": body request cần chứa total_time và slide_count
exports.createLesson = async (req, res) => {
  // Các trường chung
  const { course_id, title, description, type } = req.body;
  try {
    await pool.query('BEGIN');
    // Chèn dữ liệu vào bảng lessons
    const lessonResult = await pool.query(
      `INSERT INTO lessons (course_id, title, description, type)
       VALUES ($1, $2, $3, $4) RETURNING lesson_id`,
      [course_id, title, description, type]
    );
    const lesson_id = lessonResult.rows[0].lesson_id;

    if (type === 'video') {
      // Lấy các trường đặc thù của video
      const { video_url, duration, file_size, format, segments } = req.body;
      const videoResult = await pool.query(
        `INSERT INTO videolessons (lesson_id, video_url, duration, file_size, format)
         VALUES ($1, $2, $3, $4, $5) RETURNING video_lesson_id`,
        [lesson_id, video_url, duration, file_size, format]
      );
      const video_lesson_id = videoResult.rows[0].video_lesson_id;

      // Nếu có mảng segments, chèn từng đoạn vào bảng video_segments
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
      // Lấy các trường đặc thù của slideshow
      const { total_time, slide_count } = req.body;
      await pool.query(
        `INSERT INTO slidelessons (lesson_id, total_time, slide_count)
         VALUES ($1, $2, $3)`,
        [lesson_id, total_time, slide_count]
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

// Cập nhật bài giảng
// Chỉ cập nhật các trường của bảng lessons. Việc cập nhật dữ liệu của videolessons hay slidelessons có thể được triển khai riêng nếu cần.
exports.updateLesson = async (req, res) => {
  const { id } = req.params;
  const { title, description, type } = req.body;
  try {
    const result = await pool.query(
      `UPDATE lessons SET title = COALESCE($1, title),
                           description = COALESCE($2, description),
                           type = COALESCE($3, type),
                           updated_at = NOW()
       WHERE lesson_id = $4 RETURNING *`,
      [title, description, type, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ message: 'Lesson updated', lesson: result.rows[0] });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
};

// Xóa bài giảng (các dữ liệu liên quan trong videolessons hoặc slidelessons sẽ bị xóa theo cascade nếu có cấu hình)
exports.deleteLesson = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM lessons WHERE lesson_id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ message: 'Lesson deleted', lesson: result.rows[0] });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
};

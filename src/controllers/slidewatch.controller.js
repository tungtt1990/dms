// src/controllers/slidewatch.controller.js
const pool = require('../config/db');

// Endpoint cập nhật tổng hợp phiên xem slideshow
exports.updateSlideCompleted = async (req, res) => {
  try {
    const { user_id } = req.user; // Lấy user_id từ token
    const { slide_lesson_id, current_slide_number, slide_number_completed } = req.body;

    if (!slide_lesson_id || !current_slide_number) {
      return res.status(400).json({ error: "Thiếu thông tin đầu vào!" });
    }

    // Lấy thời gian tối thiểu cần xem để tính là hoàn thành
    const slideLesson = await pool.query(
      `SELECT slide_count, min_percentage_required FROM slide_lessons WHERE slide_lesson_id = $1`,
      [slide_lesson_id]
    );

    if (slideLesson.rows.length === 0) {
      return res.status(404).json({ error: "Bài giảng slide không tồn tại!" });
    }
    const slideCount = slideLesson.rows[0].slide_count;
    const minPercentageRequired = slideLesson.rows[0].min_percentage_required;

    // Lấy danh sách slide_page_completed hiện tại
    const result = await pool.query(
      `SELECT slide_page_completed FROM slide_watch_progress 
         WHERE user_id = $1 AND slide_lesson_id = $2`,
      [user_id, slide_lesson_id]
    );

    let completedSlides = result.rows.length > 0 ? result.rows[0].slide_page_completed : [];

    // Nếu slide đã có trong danh sách, không thêm lại
    if (!completedSlides.includes(slide_number_completed)) {
      completedSlides.push(slide_number_completed);
    }

    let viewed_percentage = Math.round((completedSlides.length / slideCount) * 100);
    let completion_status = viewed_percentage >= minPercentageRequired ? 'completed' : 'in-progress';

    // Cập nhật vào slide_watch_progress
    await pool.query(
      `INSERT INTO slide_watch_progress (user_id, slide_lesson_id, current_slide_number, completed_slides, viewed_percentage, slide_page_completed, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
         ON CONFLICT (user_id, slide_lesson_id) 
         DO UPDATE SET 
            current_slide_number = EXCLUDED.current_slide_number,
            completed_slides = EXCLUDED.completed_slides + 1,
            viewed_percentage = EXCLUDED.viewed_percentage,
            slide_page_completed = EXCLUDED.slide_page_completed,
            completion_status = $7,
            updated_at = CURRENT_TIMESTAMP`,
      [user_id, slide_lesson_id, current_slide_number, completedSlides.length, viewed_percentage, JSON.stringify(completedSlides), completion_status]
    );

    res.json({ message: "Cập nhật tiến trình thành công!", slide_page_completed: completedSlides });
  } catch (error) {
    console.error("Lỗi khi cập nhật tiến trình slide:", error);
    res.status(500).json({ error: "Lỗi server!" });
  }
};

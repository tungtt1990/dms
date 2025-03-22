const pool = require('../config/db');

exports.getAllSubjects = async (req, res) => {
    try {
        const { user_id } = req.user;

        // Lấy danh sách môn học kèm tiến trình học tập của học viên
        const result = await pool.query(
            `SELECT 
                s.subject_id,
                s.subject_name,
                s.description,
                slp.is_unlocked,
                slp.slide_lesson_progress,
                slp.video_lesson_progress,
                slp.practice_exercises_progress,
                slp.test_page_progress,
                slp.status
            FROM subjects s
            JOIN student_learning_progress slp ON s.subject_id = slp.subject_id
            WHERE slp.user_id = $1
            ORDER BY s.subject_id`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Không có môn học nào được tìm thấy." });
        }

        // Xử lý dữ liệu để trả về danh sách môn học
        const subjects = result.rows.map((row) => ({
            subject_id: row.subject_id,
            subject_name: row.subject_name,
            description: row.description,
            is_unlocked: row.is_unlocked,
            slide_lesson_progress: row.slide_lesson_progress || 0,
            video_lesson_progress: row.video_lesson_progress || 0,
            practice_exercises_progress: row.practice_exercises_progress || 0,
            test_page_progress: row.test_page_progress || 0,
            status: row.status || "in_progress"
        }));

        res.json({ subjects });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách môn học:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

module.exports = exports;
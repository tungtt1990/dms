// controllers/lesson.Controller.js
const pool = require('../config/db');

exports.getSlideLessons = async (req, res) => {
  // Lấy user_id từ thông tin đăng nhập (ví dụ: JWT đã giải mã)
  const userId = req.user.user_id;
  // Lấy subject_id từ query string
  const { subjectId, lessonType } = req.params;

  if (!userId || !subjectId) {
    return res.status(400).json({ message: 'Thiếu tham số user_id hoặc subjectId' });
  }

  try {
    var result;
    switch (lessonType) {
      case 'slideshow':
        result = await getSlideLessons(userId, subjectId);
        break;
      case 'video':
        result = await getVideoLessons(userId, subjectId);
        break;
      case 'practice_exercises':
        result = await getPracticeExercises(userId, subjectId);
        break;
      case 'testPaper':
        result = await getTestPapers(userId, subjectId);
        break;
      default:  // Mặc định trả về bài giảng loại "slideshow" nếu không có lessonType
        result = await getSlideLessons(userId, subjectId);
        break;
    }
    res.json(result);

  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy danh sách bài học loại "slideshow" của môn học được chọn
async function getSlideLessons(userId, subjectId) {
  // Truy vấn các bài học loại "slideshow" của môn học được chọn
  // JOIN với slidelessons để lấy thông tin chi tiết slide, bao gồm path_url và extension
  // LEFT JOIN với slide_watch_progress để lấy tiến độ học của học viên
  const query = `
        SELECT 
          l.lesson_id,
          l.title,
          l.description,
          ls.slide_lesson_id,
          ls.slide_count,
          ls.path_url,
          ls.extension,
          ls.total_time,
          ls.min_time_per_slide,
          ls.min_percentage_required,
          swp.current_slide_number,
          swp.completed_slides,
          swp.completion_status,
          swp.viewed_percentage
        FROM lessons l
        JOIN slide_lessons ls ON l.lesson_id = ls.lesson_id
        LEFT JOIN slide_watch_progress swp 
          ON ls.slide_lesson_id = swp.slide_lesson_id AND swp.user_id = $1
        WHERE l.type = 'slideshow'
          AND l.subject_id = $2
          AND l.deleted_at IS NULL
          AND ls.deleted_at IS NULL
        ORDER BY l.lesson_id ASC
      `;
  const params = [userId, subjectId];

  const resultQuery = await pool.query(query, params);

  // Map kết quả trả về
  const result = resultQuery.rows.map(row => ({
    lesson_id: row.lesson_id,
    title: row.title,
    description: row.description,
    slide_lesson_id: row.slide_lesson_id,
    total_slides: row.slide_count,
    path_url: row.path_url,
    extension: row.extension,
    total_time: row.total_time,
    min_time_per_slide: row.min_time_per_slide,
    min_percentage_required: row.min_percentage_required,
    current_slide_number: row.current_slide_number || 0,
    completed_slides: row.completed_slides || 0,
    viewed_percentage: row.viewed_percentage || 0,
    status: row.completion_status ? 'Hoàn thành' : (row.completed_slides > 0 ? 'Đang học' : 'Chưa bắt đầu')
  }));

  return result;
}

// Lấy danh sách bài học loại "video" của môn học được chọn
async function getVideoLessons(userId, subjectId) {

  // Lấy danh sách video lessons và tiến trình học tập của học viên
  const result = await pool.query(
    `SELECT 
        l.lesson_id,
        l.title AS lesson_title,
        l.description AS lesson_description,
        vl.video_lesson_id,
        vl.video_url,
        vl.duration,
        vl.min_watch_percentage,
        vwa.total_watched_duration,
        vwa.viewed_percentage,
        vwa.last_stop_time,
        vwa.is_completed
    FROM video_lessons vl
    JOIN lessons l ON vl.lesson_id = l.lesson_id
    JOIN student_learning_progress slp ON l.subject_id = slp.subject_id AND slp.user_id = $1
    LEFT JOIN video_watch_aggregates vwa ON vwa.video_lesson_id = vl.video_lesson_id AND vwa.user_id = $1
    WHERE slp.subject_id = $2 AND slp.is_unlocked = TRUE
    ORDER BY vl.video_lesson_id`,
    [userId, subjectId]
  );

  if (result.rows.length === 0) {
    return { error: "Không có bài giảng video nào hoặc môn học chưa được mở khóa." }
  }

  // Xử lý dữ liệu để trả về danh sách bài giảng video
  const videoLessons = result.rows.map((row) => ({
    lesson_id: row.lesson_id,
    title: row.title,
    description: row.description,
    video_lesson_id: row.video_lesson_id,
    video_url: row.video_url,
    duration: row.duration,
    min_watch_percentage: row.min_watch_percentage,
    viewed_percentage: row.viewed_percentage || 0,
    last_watched_position: row.last_watched_position || 0,
    completion_status: row.completion_status || "in_progress"
  }));

  return videoLessons;
}

// Lấy danh sách bài tập thực hành của môn học được chọn
async function getPracticeExercises(userId, subjectId) {
  const query = `
        SELECT pe.id AS exercise_id, pe.title, pe.description, pe.total_questions, pe.time_limit,
               ps.status, ps.answers
        FROM practice_exercises pe
        LEFT JOIN practice_sessions ps 
            ON pe.id = ps.exercise_id AND ps.student_id = $1
        WHERE pe.subject_id = $2;
    `;

  const result = await db.query(query, [userId, subjectId]);

  // Format dữ liệu trả về
  const exercises = result.rows.map(row => ({
    exercise_id: row.exercise_id,
    title: row.title,
    description: row.description,
    total_questions: row.total_questions,
    time_limit: row.time_limit,
    status: row.status || "not_started", // Nếu chưa có session => chưa làm
    progress: row.answers ? Object.keys(row.answers).length / row.total_questions * 100 : 0
  }));

  return exercises;
}

exports.getPracticeExercisesDetails = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    const { exercise_id } = req.params;

    // 🟢 Chạy truy vấn chỉ 1 lần để lấy toàn bộ dữ liệu
    const result = await db.query(
      `SELECT 
            pe.exercise_id AS exercise_id, pe.title AS exercise_title, pe.description, pe.total_questions, pe.time_limit,
            q.question_id, q.content AS question_content, q.image_url AS question_image, 
            q.explanation, q.explanation_image_url, q.difficulty_level,
            peq.order_index, peq.marks,
            json_agg(
                json_build_object(
                    'answer_id', a.answer_id, 
                    'content', a.content, 
                    'image_url', a.image_url, 
                    'is_correct', a.is_correct,
                    'order_index', a.order_index
                )
            ) AS answers,
            ps.answers AS student_answers
        FROM practice_exercises pe
        JOIN practice_exercise_questions peq ON pe.exercise_id = peq.exercise_id
        JOIN questions q ON peq.question_id = q.question_id
        LEFT JOIN answers a ON q.question_id = a.question_id
        LEFT JOIN practice_sessions ps ON pe.exercise_id = ps.exercise_id AND ps.user_id = $2
        WHERE pe.exercise_id = $1
        GROUP BY pe.exercise_id, q.question_id, peq.order_index, peq.marks, ps.answers
        ORDER BY peq.order_index;`,
      [exercise_id, user_id]
    );

    // 🟢 Kiểm tra nếu bài tập không tồn tại
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Bài tập không tồn tại" });
    }

    // 🟢 Format dữ liệu trả về
    const exercise = {
      exercise_id: result.rows[0].exercise_id,
      title: result.rows[0].exercise_title,
      description: result.rows[0].description,
      total_questions: result.rows[0].total_questions,
      time_limit: result.rows[0].time_limit
    };

    // 🟢 Xử lý danh sách câu hỏi
    const questions = result.rows.map(row => ({
      question_id: row.question_id,
      content: row.question_content,
      image_url: row.question_image,
      explanation: row.explanation,
      explanation_image_url: row.explanation_image_url,
      difficulty_level: row.difficulty_level,
      order_index: row.order_index,
      marks: row.marks,
      answers: row.answers || [],
      student_answer: row.student_answers?.[row.question_id]?.student_answer || null,
      is_correct: row.student_answers?.[row.question_id]?.correct || null
    }));

    res.json({ exercise, questions });

  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài tập:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Lấy danh sách đề thi của môn học được chọn
async function getTestPapers(userId, subjectId) {

}

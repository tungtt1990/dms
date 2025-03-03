-- 1. USERS và LOGIN_HISTORY
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE login_history (
    login_history_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    login_time TIMESTAMP NOT NULL,
    logout_time TIMESTAMP,
    ip_address VARCHAR(50),
    device_info TEXT
);

-- 2. COURSES
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. COURSE_ENROLLMENTS: Liên kết học viên với khóa học
CREATE TABLE course_enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, student_id)
);

-- 4. COURSE_TEACHERS: Liên kết giáo viên với khóa học
CREATE TABLE course_teachers (
    assignment_id SERIAL PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
    teacher_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    assignment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (course_id, teacher_id)
);

-- 5. LESSONS: Bài giảng của khóa học
CREATE TABLE lessons (
    lesson_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'slideshow')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. VIDEOLESSONS: Thông tin cụ thể của bài giảng video
CREATE TABLE videolessons (
    video_lesson_id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    duration INT, -- thời lượng video (giây)
    file_size BIGINT,
    format VARCHAR(20)
);

-- 7. SLIDELESSONS: Thông tin bài giảng slideshow
CREATE TABLE slidelessons (
    slide_lesson_id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    total_time INT,  -- tổng thời gian quy định (giây)
    slide_count INT
);

-- 8a. VIDEO_WATCH_SESSIONS: Log chi tiết phiên xem video
CREATE TABLE video_watch_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    video_lesson_id INT NOT NULL REFERENCES videolessons(video_lesson_id) ON DELETE CASCADE,
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP,
    milestones JSONB,  -- danh sách các mốc thời gian (ví dụ dưới dạng JSON)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8b. VIDEO_WATCH_AGGREGATES: Thông tin tổng hợp phiên xem video cho mỗi học viên
CREATE TABLE video_watch_aggregates (
    aggregate_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    video_lesson_id INT NOT NULL REFERENCES videolessons(video_lesson_id) ON DELETE CASCADE,
    last_stop_time INT,  -- thời điểm dừng cuối (giây)
    total_watch_time INT,  -- tổng thời gian đã xem (giây)
    status VARCHAR(20) CHECK (status IN ('incomplete', 'complete')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, video_lesson_id)
);

-- 9a. SLIDE_WATCH_SESSIONS: Log chi tiết phiên xem slideshow
CREATE TABLE slide_watch_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    slide_lesson_id INT NOT NULL REFERENCES slidelessons(slide_lesson_id) ON DELETE CASCADE,
    session_start TIMESTAMP NOT NULL,
    session_end TIMESTAMP,
    milestones JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9b. SLIDE_WATCH_AGGREGATES: Thông tin tổng hợp phiên xem slideshow
CREATE TABLE slide_watch_aggregates (
    aggregate_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    slide_lesson_id INT NOT NULL REFERENCES slidelessons(slide_lesson_id) ON DELETE CASCADE,
    last_stop_time INT,
    total_watch_time INT,
    status VARCHAR(20) CHECK (status IN ('incomplete', 'complete')),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, slide_lesson_id)
);

-- 10. EXAMS: Thông tin đề thi của khóa học
CREATE TABLE exams (
    exam_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    exam_title VARCHAR(200) NOT NULL,
    duration INT, -- thời gian thi (phút)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. TEST_SESSIONS: Phiên thi của học viên
CREATE TABLE test_sessions (
    exam_session_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    exam_id INT NOT NULL REFERENCES exams(exam_id) ON DELETE CASCADE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    score DECIMAL(5,2),
    status VARCHAR(20),
    answers JSONB,  -- lưu toàn bộ bài làm dưới dạng JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12a. QUESTION_BANK: Ngân hàng câu hỏi (nếu cần phân loại theo môn/học phần)
CREATE TABLE question_banks (
    bank_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id) ON DELETE SET NULL,
    name VARCHAR(100),
    description TEXT
);

-- 12b. QUESTIONS: Danh sách các câu hỏi (chỉ có text và hình ảnh)
CREATE TABLE questions (
    question_id SERIAL PRIMARY KEY,
    bank_id INT REFERENCES question_banks(bank_id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    explanation TEXT,
    explanation_image_url TEXT,
    difficulty_level INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12c. ANSWERS: Lưu trữ đáp án cho từng câu hỏi
CREATE TABLE answers (
    answer_id SERIAL PRIMARY KEY,
    question_id INT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    image_url TEXT,
    is_correct BOOLEAN NOT NULL,  -- TRUE nếu đây là đáp án đúng
    order_index INT,              -- Sắp xếp thứ tự của đáp án
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13a. TEST_PAPERS: Bộ đề thi được tạo bởi giáo viên
CREATE TABLE test_papers (
    exam_paper_id SERIAL PRIMARY KEY,
    teacher_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    duration INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13b. EXAM_PAPER_QUESTIONS: Danh sách câu hỏi thuộc bộ đề thi
CREATE TABLE exam_paper_questions (
    id SERIAL PRIMARY KEY,
    exam_paper_id INT NOT NULL REFERENCES test_papers(exam_paper_id) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES questions(question_id) ON DELETE CASCADE,
    order_index INT,
    marks INT
);

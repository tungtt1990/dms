const pool = require("../config/db");
const { Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    TextRun,
    convertInchesToTwip
} = require("docx");

// Lấy danh sách khóa học mà giáo viên đang dạy
exports.getTeacherCourses = async (req, res) => {
    try {
        const { user_id } = req.user;

        const result = await pool.query(
            `SELECT c.course_id, c.course_name, c.start_date, c.end_date, COUNT(ce.student_id) AS total_students
             FROM courses c
             JOIN course_teachers ct ON c.course_id = ct.course_id
             LEFT JOIN course_enrollments ce ON c.course_id = ce.course_id
             WHERE ct.teacher_id = $1
             GROUP BY c.course_id`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Giáo viên chưa được phân vào khóa học nào." });
        }

        res.json({ courses: result.rows });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách khóa học của giáo viên:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

// API lấy tiến trình học tập của học viên trong khóa học
exports.getCourseProgress = async (req, res) => {
    try {
        const { user_id } = req.user; // Giáo viên đăng nhập
        const { course_id } = req.params;

        // Kiểm tra giáo viên có dạy khóa học này không
        const checkTeacher = await pool.query(
            `SELECT 1 FROM course_teachers WHERE teacher_id = $1 AND course_id = $2`,
            [user_id, course_id]
        );

        if (checkTeacher.rows.length === 0) {
            return res.status(403).json({ error: "Bạn không có quyền xem học viên của khóa học này." });
        }

        // Lấy danh sách môn học trong khóa học
        const subjectsQuery = await pool.query(
            `SELECT subject_id, subject_name FROM subjects ORDER BY subject_id`
        );
        const subjects = subjectsQuery.rows;

        // Lấy danh sách học viên & tiến trình học tập theo môn học
        const studentQuery = await pool.query(
            `SELECT u.user_id, u.full_name, c.course_name, slp.subject_id, 
                    slp.slide_lesson_progress, slp.video_lesson_progress, 
                    slp.practice_exercises_progress, slp.test_page_progress, slp.status
             FROM users u
             JOIN course_enrollments ce ON u.user_id = ce.student_id
             JOIN courses c ON ce.course_id = c.course_id
             LEFT JOIN student_learning_progress slp ON u.user_id = slp.user_id
             WHERE ce.course_id = $1
             ORDER BY u.user_id, slp.subject_id`,
            [course_id]
        );

        if (studentQuery.rows.length === 0) {
            return res.status(404).json({ error: "Không có học viên nào trong khóa học này." });
        }

        // Xử lý dữ liệu thành dạng bảng
        const studentMap = new Map();

        studentQuery.rows.forEach((row) => {
            if (!studentMap.has(row.user_id)) {
                studentMap.set(row.user_id, {
                    stt: studentMap.size + 1,
                    name: row.full_name,
                    course_name: row.course_name,
                    subjects: {},
                    status: "Chưa đạt"
                });
            }

            const student = studentMap.get(row.user_id);
            student.subjects[row.subject_id] = row.slide_lesson_progress || 0;

            // Nếu có bất kỳ môn nào đang học thì trạng thái là "Đang học"
            if (row.slide_lesson_progress > 0 && row.status !== "completed") {
                student.status = "Đang học";
            }

            // Nếu tất cả môn đều hoàn thành, thì trạng thái là "Hoàn thành"
            const completedSubjects = Object.values(student.subjects).filter((progress) => progress === 100).length;
            if (completedSubjects === subjects.length) {
                student.status = "Hoàn thành";
            }
        });

        // Chuyển Map thành danh sách
        const students = Array.from(studentMap.values()).map((student) => {
            const subjectProgress = subjects.map((subject) => ({
                [subject.subject_name]: student.subjects[subject.subject_id] || 0
            }));

            return {
                stt: student.stt,
                student_name: student.name,
                course_name: student.course_name,
                ...Object.assign({}, ...subjectProgress),
                status: student.status
            };
        });

        res.json({ students });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách học viên theo khóa học:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

exports.exportProgressStudent = async (req, res) => {
    try {
        const { user_id } = req.params;
        if (!user_id) return res.status(400).json({ error: "Missing user_id" });

        // Query dữ liệu
        const result = await pool.query(
            `SELECT u.full_name, up.registration_code, up.date_of_birth, c.course_code, c.course_rank,
                    slp.*, s.subject_name
             FROM student_learning_progress slp
             JOIN users u ON slp.user_id = u.user_id
			 JOIN course_enrollments ce ON u.user_id = ce.student_id
             LEFT JOIN user_profiles up ON up.user_id = u.user_id
             JOIN subjects s ON slp.subject_id = s.subject_id
             JOIN courses c ON ce.course_id = c.course_id
             WHERE slp.user_id = $1`,
            [user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No data found" });
        }
        const user = result.rows[0];

        // Cấu hình trang A4
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        size: { width: convertInchesToTwip(8.27), height: convertInchesToTwip(11.69) },
                        margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
                    },
                },
                children: [
                    new Table({
                        columnWidths: [3000, 5000],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "THANH HÓA", bold: true })] })], borders: {} }),
                                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true })] })], borders: {} }),
                                ],
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "TTĐTLX - Trường CĐN LILAMA 1", bold: true })] })], borders: {} }),
                                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Độc Lập - Tự Do – Hạnh Phúc", bold: true })] })], borders: {} }),
                                ],
                            })
                        ],
                    }),
                    new Paragraph({
                        alignment: AlignmentType.CENTER, children: [
                            new TextRun({ text: "KẾT QUẢ HỌC TẬP CÁC MÔN LÍ THUYẾT", bold: true, size: 32 })
                        ]
                    }),
                    new Paragraph(`Học viên: ${user.name}`),
                    new Paragraph(`Mã học viên: ${user.student_code}`),
                    new Paragraph(`Ngày sinh: ${user.birth_date}`),
                    new Paragraph(`Khóa học: ${user.course_code}`),
                    new Paragraph(`Trình độ đào tạo: ${user.training_level}`),
                    new Paragraph(`Cơ sở đào tạo: ${user.training_center}`),
                    new Table({
                        columnWidths: [1000, 3000, 2000, 2000, 2500, 2500, 2500],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph("STT")] }),
                                    new TableCell({ children: [new Paragraph("Tên môn học")] }),
                                    new TableCell({ children: [new Paragraph("Giờ đăng nhập")] }),
                                    new TableCell({ children: [new Paragraph("Tài liệu học")] }),
                                    new TableCell({ children: [new Paragraph("Giờ học tối thiểu (h)/ làm đề thi tối thiểu")] }),
                                    new TableCell({ children: [new Paragraph("Thời gian đã học/ Số đề đã đạt")] }),
                                    new TableCell({ children: [new Paragraph("Kết quả môn học (đạt/ chưa đạt)")] }),
                                ],
                            }),
                            ...result.rows.map((row, index) => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph((index + 1).toString())] }),
                                    new TableCell({ children: [new Paragraph(row.subject_name)] }),
                                    new TableCell({ children: [new Paragraph(row.login_time ? row.login_time.toString() : "-")] }),
                                    new TableCell({ children: [new Paragraph("Văn bản, Video, Ôn tập, Thi")] }),
                                    new TableCell({ children: [new Paragraph("-")] }),
                                    new TableCell({ children: [new Paragraph(`${Math.round(row.slide_lesson_progress)}g / ${Math.round(row.test_page_progress)}`)] }),
                                    new TableCell({ children: [new Paragraph(row.status === "completed" ? "Đạt" : "Chưa đạt")] }),
                                ],
                            }))
                        ],
                    }),
                    new Table({
                        columnWidths: [3000, 5000],
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "XÁC NHẬN CỦA HỌC VIÊN", bold: true })] })], borders: {} }),
                                    new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "XÁC NHẬN CỦA CƠ SỞ ĐÀO TẠO", bold: true })] })], borders: {} }),
                                ],
                            })
                        ],
                    })
                ],
            }],
        });

        // Xuất file DOCX
        const buffer = await Packer.toBuffer(doc);
        res.setHeader("Content-Disposition", "attachment; filename=report.docx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.send(buffer);
    } catch (error) {
        console.error("Error exporting report:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

// API lấy báo cáo học viên theo khóa học - giúp giáo viên nắm tổng quan tiến trình học tập của học viên
exports.reportByCourse = async (req, res) => {
    try {
        const { user_id } = req.user; // Giáo viên đăng nhập
        const { course_id } = req.params;

        // Kiểm tra giáo viên có dạy khóa học này không
        const checkTeacher = await pool.query(
            `SELECT 1 FROM course_teachers WHERE teacher_id = $1 AND course_id = $2`,
            [user_id, course_id]
        );

        if (checkTeacher.rows.length === 0) {
            return res.status(403).json({ error: "Bạn không có quyền xem học viên của khóa học này." });
        }

        // Lấy danh sách môn học trong khóa học
        const subjectsQuery = await pool.query(
            `SELECT subject_id, subject_name FROM subjects ORDER BY subject_id`
        );
        const subjects = subjectsQuery.rows;

        // Lấy danh sách học viên & tiến trình học tập theo môn học
        const studentQuery = await pool.query(
            `SELECT u.user_id, u.name, c.course_name, slp.subject_id, 
                    slp.slide_lesson_progress, slp.video_lesson_progress, 
                    slp.practice_exercises_progress, slp.test_page_progress, slp.status
             FROM users u
             JOIN course_enrollments ce ON u.user_id = ce.student_id
             JOIN courses c ON ce.course_id = c.course_id
             LEFT JOIN student_learning_progress slp ON u.user_id = slp.user_id
             WHERE ce.course_id = $1
             ORDER BY u.user_id, slp.subject_id`,
            [course_id]
        );

        if (studentQuery.rows.length === 0) {
            return res.status(404).json({ error: "Không có học viên nào trong khóa học này." });
        }

        // Xử lý dữ liệu thành dạng bảng
        const studentMap = new Map();

        studentQuery.rows.forEach((row) => {
            if (!studentMap.has(row.user_id)) {
                studentMap.set(row.user_id, {
                    stt: studentMap.size + 1,
                    name: row.name,
                    course_name: row.course_name,
                    subjects: {},
                    status: "Chưa đạt"
                });
            }

            const student = studentMap.get(row.user_id);
            student.subjects[row.subject_id] = row.slide_lesson_progress || 0;

            // Nếu có bất kỳ môn nào đang học thì trạng thái là "Đang học"
            if (row.slide_lesson_progress > 0 && row.status !== "completed") {
                student.status = "Đang học";
            }

            // Nếu tất cả môn đều hoàn thành, thì trạng thái là "Hoàn thành"
            const completedSubjects = Object.values(student.subjects).filter((progress) => progress === 100).length;
            if (completedSubjects === subjects.length) {
                student.status = "Hoàn thành";
            }
        });

        // Chuyển Map thành danh sách
        const students = Array.from(studentMap.values()).map((student) => {
            const subjectProgress = subjects.map((subject) => ({
                [subject.subject_name]: student.subjects[subject.subject_id] || 0
            }));

            return {
                stt: student.stt,
                name: student.name,
                course_name: student.course_name,
                ...Object.assign({}, ...subjectProgress),
                status: student.status
            };
        });

        res.json({ students });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách học viên theo khóa học:", error);
        res.status(500).json({ error: "Lỗi server" });
    }
};

module.exports = exports;

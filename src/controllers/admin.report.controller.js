// src/controllers/user.controller.js
const pool = require('../config/db');

exports.exportProgressLearning = async (req, res) => {
  try {
    const { user_id } = req.query;
    if (!user_id) return res.status(400).json({ error: "Missing user_id" });

    // Query dữ liệu
    const result = await pool.query(
      `SELECT u.name, u.student_code, u.birth_date, u.training_center, c.course_code, c.training_level,
                slp.*, s.subject_name
         FROM student_learning_progress slp
         JOIN users u ON slp.user_id = u.user_id
         JOIN subjects s ON slp.subject_id = s.subject_id
         JOIN courses c ON u.course_i
         
         
         
         d = c.course_id
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

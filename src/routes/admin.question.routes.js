// src/routes/admin.question.routes.js
const express = require('express');
const router = express.Router();
const adminQuestionController = require('../controllers/admin.question.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

// GET tất cả câu hỏi (bao gồm đáp án)
router.get('/', adminQuestionController.getAllQuestions);

// GET chi tiết câu hỏi theo ID (bao gồm danh sách đáp án)
router.get('/:id', adminQuestionController.getQuestionById);

// POST tạo câu hỏi mới cùng với các đáp án
router.post('/', adminQuestionController.createQuestion);

// PUT cập nhật câu hỏi (và cập nhật đáp án)
router.put('/:id', adminQuestionController.updateQuestion);

// DELETE xóa câu hỏi (đáp án sẽ bị xóa theo cascade)
router.delete('/:id', adminQuestionController.deleteQuestion);

module.exports = router;

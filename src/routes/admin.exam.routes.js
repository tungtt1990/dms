// src/routes/admin.exam.routes.js
const express = require('express');
const router = express.Router();
const adminExamController = require('../controllers/admin.exam.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

// CRUD cho Exams
router.get('/', adminExamController.getAllExams);
router.get('/:id', adminExamController.getExamById);
router.post('/', adminExamController.createExam);
router.put('/:id', adminExamController.updateExam);
router.delete('/:id', adminExamController.deleteExam);

module.exports = router;

// src/routes/admin.lesson.routes.js
const express = require('express');
const router = express.Router();
const adminLessonController = require('../controllers/admin.lesson.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

// CRUD cho Lesson
router.get('/', adminLessonController.getAllLessons);
router.get('/:id', adminLessonController.getLessonById);
router.post('/', adminLessonController.createLesson);
router.put('/:id', adminLessonController.updateLesson);
router.delete('/:id', adminLessonController.deleteLesson);

module.exports = router;

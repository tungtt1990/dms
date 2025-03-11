// src/routes/index.js
const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));

// admin router
router.use('/admin/users', require('./admin.user.routes')); 
router.use('/admin/courses', require('./admin.course.routes'));
router.use('/admin/lessons', require('./admin.lesson.routes'));
router.use('/admin/activity', require('./admin.activity.routes'));
router.use('/admin/questions', require('./admin.question.routes'));
router.use('/admin/testpapers', require('./admin.testpaper.routes'));
router.use('/admin/practice', require('./admin.practice.routes.js'));
router.use('/admin/practice-exercise-questions', require('./admin.practiceExerciseQuestion.routes'));

// Các router khác...
router.use('/courses', require('./course.routes'));
router.use('/lessons', require('./lesson.routes'));
router.use('/videowatch', require('./videowatch.routes'));
router.use('/slidewatch', require('./slidewatch.routes'));
router.use('/testpapers', require('./testpaper.routes'));

module.exports = router;

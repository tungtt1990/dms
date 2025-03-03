// src/routes/admin.course.routes.js
const express = require('express');
const router = express.Router();
const adminCourseController = require('../controllers/admin.course.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// Áp dụng middleware cho tất cả các endpoint
router.use(authenticateToken, isAdmin);

// CRUD cho Course
router.get('/', adminCourseController.getAllCourses);
router.get('/:id', adminCourseController.getCourseById);
router.post('/', adminCourseController.createCourse);
router.put('/:id', adminCourseController.updateCourse);
router.delete('/:id', adminCourseController.deleteCourse);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminCourseController = require('../controllers/admin.course.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

// Áp dụng middleware cho tất cả các endpoint
router.use(authenticateToken, isAdmin);

/**
 * @swagger
 * /admin/courses:
 *   get:
 *     summary: Retrieve all courses
 *     description: Retrieve a list of all courses.
 *     tags: [Admin Course]
 *     responses:
 *       200:
 *         description: A list of courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// CRUD cho Course - Lấy tất cả khóa học
// Absolute path: /admin/courses
router.get('/', adminCourseController.getAllCourses);

/**
 * @swagger
 * /admin/courses/{id}:
 *   get:
 *     summary: Retrieve a course by ID
 *     description: Retrieve a specific course by its ID.
 *     tags: [Admin Course]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: A course object.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */
// CRUD cho Course - Lấy khóa học theo ID
// Absolute path: /admin/courses/{id}
router.get('/:id', adminCourseController.getCourseById);

/**
 * @swagger
 * /admin/courses:
 *   post:
 *     summary: Create a new course
 *     description: Create a new course.
 *     tags: [Admin Course]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               course_name:
 *                 type: string
 *                 description: The name of the course
 *               description:
 *                 type: string
 *                 description: The description of the course
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: The start date of the course
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: The end date of the course
 *     responses:
 *       201:
 *         description: Course created successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
// CRUD cho Course - Tạo khóa học mới
// Absolute path: /admin/courses
router.post('/', adminCourseController.createCourse);

/**
 * @swagger
 * /admin/courses/{id}:
 *   put:
 *     summary: Update a course by ID
 *     description: Update a specific course by its ID.
 *     tags: [Admin Course]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               course_name:
 *                 type: string
 *                 description: The name of the course
 *               description:
 *                 type: string
 *                 description: The description of the course
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: The start date of the course
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: The end date of the course
 *     responses:
 *       200:
 *         description: Course updated successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */
// CRUD cho Course - Cập nhật khóa học theo ID
// Absolute path: /admin/courses/{id}
router.put('/:id', adminCourseController.updateCourse);

/**
 * @swagger
 * /admin/courses/{id}:
 *   delete:
 *     summary: Delete a course by ID
 *     description: Delete a specific course by its ID.
 *     tags: [Admin Course]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */
// CRUD cho Course - Xóa khóa học theo ID
// Absolute path: /admin/courses/{id}
router.delete('/:id', adminCourseController.deleteCourse);

module.exports = router;
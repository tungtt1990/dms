// src/routes/admin.testpaper.routes.js
const express = require('express');
const router = express.Router();
const adminTestpaperController = require('../controllers/admin.testpaper.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

// CRUD cho Test Papers
router.get('/', adminTestpaperController.getAllTestPapers);
router.get('/:id', adminTestpaperController.getTestPaperById);
router.post('/', adminTestpaperController.createTestPaper);
router.put('/:id', adminTestpaperController.updateTestPaper);
router.delete('/:id', adminTestpaperController.deleteTestPaper);

module.exports = router;

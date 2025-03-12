// src/routes/admin.practiceSession.routes.js
const express = require('express');
const router = express.Router();
const adminPracticeSessionController = require('../controllers/admin.practiceSession.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/admin.middleware');

router.use(authenticateToken, isAdmin);

router.get('/', adminPracticeSessionController.getAllPracticeSessions);
router.get('/:id', adminPracticeSessionController.getPracticeSessionById);
router.post('/', adminPracticeSessionController.createPracticeSession);
router.put('/:id', adminPracticeSessionController.updatePracticeSession);
router.delete('/:id', adminPracticeSessionController.deletePracticeSession);

module.exports = router;

const express = require('express');
const router = express.Router();
const adminSubjectsController = require('../controllers/admin.subject.controller');

// Get all subjects
router.get('/', adminSubjectsController.getAllSubjects);

// Get a single subject by ID
router.get('/:id', adminSubjectsController.getSubjectById);

// Create a new subject
router.post('/', adminSubjectsController.createSubject);

// Update an existing subject
router.put('/:id', adminSubjectsController.updateSubject);

// Delete a subject
router.delete('/:id', adminSubjectsController.deleteSubject);

module.exports = router;
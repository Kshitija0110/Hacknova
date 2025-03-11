const express = require('express');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');

const Assignment = require('../models/Assignment');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Merging params allows access to params from parent router
const router = express.Router({ mergeParams: true });

// Re-route into submission router
const submissionRouter = require('./submissionRoutes');
router.use('/:assignmentId/submissions', submissionRouter);

// Protect all routes
router.use(protect);

// Routes for assignments collection
router.route('/')
  .get(
    advancedResults(Assignment, {
      path: 'course',
      select: 'name courseCode faculty'
    }),
    getAssignments
  )
  .post(authorize('faculty', 'admin'), createAssignment);

// Routes for specific assignment
router.route('/:id')
  .get(getAssignment)
  .put(authorize('faculty', 'admin'), updateAssignment)
  .delete(authorize('faculty', 'admin'), deleteAssignment);

module.exports = router;

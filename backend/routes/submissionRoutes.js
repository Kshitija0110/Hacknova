const express = require('express');
const {
  getSubmissions,
  getSubmission,
  createSubmission,
  updateSubmission,
  gradeSubmission,
  deleteSubmission
} = require('../controllers/submissionController');

const Submission = require('../models/Submission');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Merging params allows access to params from parent router
const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

router.route('/')
  .get(
    advancedResults(
      Submission,
      [
        { path: 'student', select: 'name email studentId' },
        { path: 'assignment', select: 'title dueDate points' }
      ]
    ),
    getSubmissions
  )
  .post(authorize('student'), createSubmission);

router.route('/:id')
  .get(getSubmission)
  .put(authorize('student'), updateSubmission)
  .delete(authorize('admin'), deleteSubmission);

router.route('/:id/grade')
  .put(authorize('faculty', 'admin'), gradeSubmission);

module.exports = router;
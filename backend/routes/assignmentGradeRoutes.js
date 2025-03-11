const express = require('express');
const {
  getAssignmentGrades,
  getAssignmentGrade,
  createAssignmentGrade,
  updateAssignmentGrade,
  deleteAssignmentGrade
} = require('../controllers/assignmentGradeController');

const AssignmentGrade = require('../models/AssignmentGrade');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(protect);

// Routes for grades collection
router.route('/')
  .get(
    authorize('admin', 'faculty'),
    advancedResults(
      AssignmentGrade,
      [
        { path: 'student', select: 'name rollNumber' },
        { path: 'assignment', select: 'title assignmentNumber totalMarks' },
        { path: 'course', select: 'name courseCode' },
        { path: 'gradedBy', select: 'name facultyId' }
      ]
    ),
    getAssignmentGrades
  )
  .post(authorize('admin', 'faculty'), createAssignmentGrade);

// Routes for specific grade
router.route('/:id')
  .get(authorize('admin', 'faculty', 'student'), getAssignmentGrade)
  .put(authorize('admin', 'faculty'), updateAssignmentGrade)
  .delete(authorize('admin'), deleteAssignmentGrade);

module.exports = router;

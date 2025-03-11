const express = require('express');
const {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyProfile,
  getFacultyByDepartment,
  getFacultyCourses,
  getFacultyAssignments,
  updateFacultyStatus,
  updateFacultyWorkload
} = require('../controllers/facultyController');

const Faculty = require('../models/Faculty');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(protect);

// Routes that need admin access
router.route('/')
  .get(authorize('admin'), advancedResults(Faculty, 'subjects'), getAllFaculty)
  .post(authorize('admin'), createFaculty);

// Faculty profile route (for logged in faculty)
router.get('/profile', authorize('faculty'), getFacultyProfile);

// Get faculty by department
router.get('/department/:department', authorize('admin', 'faculty'), getFacultyByDepartment);

// Routes for specific faculty
router.route('/:id')
  .get(authorize('admin', 'faculty'), getFacultyById)
  .put(authorize('admin'), updateFaculty)
  .delete(authorize('admin'), deleteFaculty);

// Update faculty status
router.patch('/:id/status', authorize('admin'), updateFacultyStatus);

// Update faculty workload
router.patch('/:id/workload', authorize('admin'), updateFacultyWorkload);

// Get faculty courses
router.get('/:id/courses', authorize('admin', 'faculty'), getFacultyCourses);

// Get faculty assignments
router.get('/:id/assignments', authorize('admin', 'faculty'), getFacultyAssignments);


module.exports = router;

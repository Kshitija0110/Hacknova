const express = require('express');
const router = express.Router();
const { 
  getAllFaculty, 
  getFacultyById, 
  createFaculty, 
  updateFaculty, 
  deleteFaculty,
  getFacultyByDepartment,
  getFacultyCourses,
  updateFacultyStatus
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

// Routes that need authentication
router.use(protect);

// Routes for all authenticated users
router.get('/:id', getFacultyById);

// Routes restricted to admin and faculty roles
router.use(authorize('admin', 'faculty'));
router.get('/department/:department', getFacultyByDepartment);

// Routes restricted to faculty role
router.use(authorize('faculty'));
router.get('/:id/courses', getFacultyCourses);

// Routes restricted to admin role
router.use(authorize('admin'));
router.get('/', getAllFaculty);
router.post('/', createFaculty);
router.put('/:id', updateFaculty);
router.delete('/:id', deleteFaculty);
router.patch('/:id/status', updateFacultyStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  getCoursesByDepartment,
  getCoursesByInstructor,
  updateCourseStatus,
  getEnrolledStudents,
  addAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// Routes that need authentication
router.use(protect);

// Routes for all authenticated users
router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.get('/department/:department', getCoursesByDepartment);

// Routes restricted to faculty and admin roles
router.use(authorize('faculty', 'admin'));
router.get('/instructor/:instructorId', getCoursesByInstructor);
router.get('/:id/students', getEnrolledStudents);

// Routes restricted to faculty role
router.post('/:id/assignments', authorize('faculty'), addAssignment);
router.put('/:id/assignments/:assignmentId', authorize('faculty'), updateAssignment);
router.delete('/:id/assignments/:assignmentId', authorize('faculty'), deleteAssignment);

// Routes restricted to admin role
router.use(authorize('admin'));
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);
router.patch('/:id/status', updateCourseStatus);

module.exports = router;
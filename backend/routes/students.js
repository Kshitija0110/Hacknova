const express = require('express');
const router = express.Router();
const { 
  getAllStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getStudentByDepartment,
  getStudentCourses,
  updateStudentStatus,
  enrollStudentInCourse,
  withdrawStudentFromCourse
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

// Routes that need authentication
router.use(protect);

// Routes for all authenticated users
router.get('/:id', getStudentById);

// Routes restricted to admin and faculty roles
router.use(authorize('admin', 'faculty'));
router.get('/department/:department', getStudentByDepartment);

// Routes restricted to student role
router.use(authorize('student'));
router.get('/:id/courses', getStudentCourses);

// Routes restricted to admin role
router.use(authorize('admin'));
router.get('/', getAllStudents);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.patch('/:id/status', updateStudentStatus);
router.post('/:id/enroll/:courseId', enrollStudentInCourse);
router.delete('/:id/withdraw/:courseId', withdrawStudentFromCourse);

module.exports = router;
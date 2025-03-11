const express = require('express');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentProfile,
  registerStudent,
  getStudentByDepartment,
  getStudentCourses,
  updateStudentStatus,
  enrollStudentInCourse,
  withdrawStudentFromCourse
} = require('../controllers/studentController');

const { getStudentAttendance, getStudentAttendanceStats } = require('../controllers/attendanceController');
const { getStudentGrades } = require('../controllers/assignmentGradeController');

const Student = require('../models/Student');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public registration route (no auth required)
router.post('/register', registerStudent);

// Use authentication middleware for all other routes
router.use(protect);

// Routes that need admin access
router.route('/')
  .get(authorize('admin'), advancedResults(Student, 'enrolledCourses'), getAllStudents)
  .post(authorize('admin'), createStudent);

// Student profile route (for logged in student)
router.get('/profile', getStudentProfile);

// Get students by department
router.get('/department/:department', authorize('admin', 'faculty'), getStudentByDepartment);

// Routes for specific student
router.route('/:id')
  .get(authorize('admin', 'faculty', 'student'), getStudentById)
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

// Update student status
router.patch('/:id/status', authorize('admin'), updateStudentStatus);

// Get student courses
router.get('/:id/courses', authorize('admin', 'faculty', 'student'), getStudentCourses);

// Enroll and withdraw from courses
router.post('/:id/enroll/:courseId', authorize('admin'), enrollStudentInCourse);
router.delete('/:id/withdraw/:courseId', authorize('admin'), withdrawStudentFromCourse);

// Get student attendance
router.get('/:studentId/attendance', authorize('admin', 'faculty', 'student'), getStudentAttendance);

// Get student attendance statistics
router.get('/:studentId/attendance/stats', authorize('admin', 'faculty', 'student'), getStudentAttendanceStats);

// Get student grades
router.get('/:studentId/grades', authorize('admin', 'faculty', 'student'), getStudentGrades);
module.exports = router;

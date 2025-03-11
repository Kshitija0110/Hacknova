const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseStudents,
  getCoursesByDepartment,
  getCoursesForFaculty,
  getCoursesForStudent,
  enrollStudentInCourse,
  removeStudentFromCourse,
  assignFacultyToCourse,
  removeFacultyFromCourse
} = require('../controllers/courseController');

const { getSubjectAttendance } = require('../controllers/attendanceController');
const { getCourseGrades } = require('../controllers/assignmentGradeController');

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Re-route into other resource routers if needed
// const assignmentRouter = require('./assignmentRoutes');
// router.use('/:courseId/assignments', assignmentRouter);

// Public routes that don't need authentication
router.route('/')
  .get(advancedResults(Course, { path: 'faculty', select: 'name facultyId' }), getCourses)
  .post(protect, authorize('admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin'), updateCourse)
  .delete(protect, authorize('admin'), deleteCourse);

// Apply protect middleware to all routes below
router.use(protect);

// Routes with specific parameters
router.route('/department/:department')
  .get(getCoursesByDepartment);

router.route('/faculty/:facultyId')
  .get(authorize('faculty', 'admin'), getCoursesForFaculty);

router.route('/student/:studentId')
  .get(authorize('student', 'admin'), getCoursesForStudent);

router.route('/:id/students')
  .get(authorize('admin', 'faculty'), getCourseStudents);

// Enrollment management routes
router.route('/:courseId/enroll/:studentId')
  .post(authorize('admin'), enrollStudentInCourse)
  .delete(authorize('admin'), removeStudentFromCourse);

// Faculty assignment routes
router.route('/:courseId/assign/:facultyId')
  .post(authorize('admin'), assignFacultyToCourse)
  .delete(authorize('admin'), removeFacultyFromCourse);

// Routes for attendance and grades
router.route('/:id/attendance')
  .get(authorize('admin', 'faculty', 'student'), (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Attendance functionality not yet implemented'
    });
  });

router.route('/:id/grades')
  .get(authorize('admin', 'faculty', 'student'), getCourseGrades);

module.exports = router;

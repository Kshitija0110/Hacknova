const express = require('express');
const {
  getAttendances,
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceByDate,
  markBulkAttendance
} = require('../controllers/attendanceController');

const Attendance = require('../models/Attendance');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(protect);

// Routes for attendance collection
router.route('/')
  .get(
    authorize('admin', 'faculty'),
    advancedResults(
      Attendance,
      [
        { path: 'student', select: 'name rollNumber' },
        { path: 'subject', select: 'name subjectCode' },
        { path: 'teacher', select: 'name teacherId' }
      ]
    ),
    getAttendances
  )
  .post(authorize('admin', 'faculty'), createAttendance);

// Bulk attendance marking
router.post('/bulk', authorize('admin', 'faculty'), markBulkAttendance);

// Get attendance by date
router.get('/date/:date', authorize('admin', 'faculty', 'student'), getAttendanceByDate);

// Routes for specific attendance record
router.route('/:id')
  .get(authorize('admin', 'faculty', 'student'), getAttendance)
  .put(authorize('admin', 'faculty'), updateAttendance)
  .delete(authorize('admin'), deleteAttendance);

module.exports = router;

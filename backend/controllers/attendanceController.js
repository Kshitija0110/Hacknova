const Attendance = require('../models/Attendance');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private/Admin, Faculty
exports.getAttendance = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private/Admin, Faculty, Student
exports.getAttendanceById = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Create new attendance record
// @route   POST /api/attendance
// @access  Private/Admin, Faculty
exports.createAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.create(req.body);

  res.status(201).json({
    success: true,
    data: attendance
  });
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private/Admin, Faculty
exports.updateAttendance = asyncHandler(async (req, res, next) => {
  let attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404));
  }

  attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: attendance
  });
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private/Admin
exports.deleteAttendance = asyncHandler(async (req, res, next) => {
  const attendance = await Attendance.findById(req.params.id);

  if (!attendance) {
    return next(new ErrorResponse(`Attendance record not found with id of ${req.params.id}`, 404));
  }

  await attendance.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get attendance by date
// @route   GET /api/attendance/date/:date
// @access  Private/Admin, Faculty, Student
exports.getAttendanceByDate = asyncHandler(async (req, res, next) => {
  const date = new Date(req.params.date);
  const attendance = await Attendance.find({ date });

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });
});

// @desc    Mark bulk attendance
// @route   POST /api/attendance/bulk
// @access  Private/Admin, Faculty
exports.markBulkAttendance = asyncHandler(async (req, res, next) => {
  const { records } = req.body;

  const attendanceRecords = await Attendance.insertMany(records);

  res.status(201).json({
    success: true,
    count: attendanceRecords.length,
    data: attendanceRecords
  });
});

// @desc    Get attendance for a specific student
// @route   GET /api/students/:studentId/attendance
// @access  Private/Admin, Faculty, Student
exports.getStudentAttendance = asyncHandler(async (req, res, next) => {
  const studentId = req.params.studentId;
  
  // Check if requesting user is the student and can access this data
  if (req.user.role === 'student' && req.user.profileId.toString() !== studentId) {
    return next(
      new ErrorResponse('Not authorized to access this attendance data', 401)
    );
  }
  
  const attendance = await Attendance.find({ student: studentId })
    .populate({
      path: 'course',
      select: 'name courseCode'
    })
    .populate({
      path: 'faculty',
      select: 'name facultyId'
    });

  res.status(200).json({
    success: true,
    count: attendance.length,
    data: attendance
  });
});

// @desc    Get attendance statistics for a specific student
// @route   GET /api/students/:studentId/attendance/stats
// @access  Private/Admin, Faculty, Student
exports.getStudentAttendanceStats = asyncHandler(async (req, res, next) => {
  const studentId = req.params.studentId;
  
  // Check if requesting user is the student and can access this data
  if (req.user.role === 'student' && req.user.profileId.toString() !== studentId) {
    return next(
      new ErrorResponse('Not authorized to access this attendance data', 401)
    );
  }
  
  // Get all attendance records for the student
  const attendanceRecords = await Attendance.find({ student: studentId });
  
  // Calculate total classes
  const totalClasses = attendanceRecords.length;
  
  // Calculate present classes
  const presentClasses = attendanceRecords.filter(record => record.status === 'present').length;
  
  // Calculate absent classes
  const absentClasses = attendanceRecords.filter(record => record.status === 'absent').length;
  
  // Calculate attendance percentage
  const attendancePercentage = totalClasses > 0 
    ? Math.round((presentClasses / totalClasses) * 100) 
    : 0;
  
  // Group attendance by course
  const courseAttendance = {};
  
  for (const record of attendanceRecords) {
    const courseId = record.course.toString();
    
    if (!courseAttendance[courseId]) {
      courseAttendance[courseId] = {
        total: 0,
        present: 0,
        absent: 0,
        percentage: 0
      };
    }
    
    courseAttendance[courseId].total += 1;
    
    if (record.status === 'present') {
      courseAttendance[courseId].present += 1;
    } else if (record.status === 'absent') {
      courseAttendance[courseId].absent += 1;
    }
    
    courseAttendance[courseId].percentage = Math.round(
      (courseAttendance[courseId].present / courseAttendance[courseId].total) * 100
    );
  }
  
  res.status(200).json({
    success: true,
    data: {
      totalClasses,
      presentClasses,
      absentClasses,
      attendancePercentage,
      courseAttendance
    }
  });
});

// Export functions needed in attendanceRoutes.js
exports.getAttendances = exports.getAttendance;

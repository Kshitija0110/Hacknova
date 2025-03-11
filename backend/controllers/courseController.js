const Course = require('../models/Course');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate({
      path: 'faculty',
      select: 'name email'
    })
    .populate({
      path: 'enrolledStudents',
      select: 'name email'
    });

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = asyncHandler(async (req, res, next) => {
  // Check if faculty exists
  if (req.body.faculty) {
    const faculty = await User.findById(req.body.faculty);
    if (!faculty || faculty.role !== 'faculty') {
      return next(new ErrorResponse(`User with ID ${req.body.faculty} is not a faculty member`, 400));
    }
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  // Check if faculty exists if being updated
  if (req.body.faculty) {
    const faculty = await User.findById(req.body.faculty);
    if (!faculty || faculty.role !== 'faculty') {
      return next(new ErrorResponse(`User with ID ${req.body.faculty} is not a faculty member`, 400));
    }
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get courses by department
// @route   GET /api/courses/department/:department
// @access  Public
exports.getCoursesByDepartment = asyncHandler(async (req, res, next) => {
  const courses = await Course.find({ department: req.params.department })
    .populate({
      path: 'faculty',
      select: 'name email'
    });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get students enrolled in a course
// @route   GET /api/courses/:id/students
// @access  Private/Admin/Faculty
exports.getCourseStudents = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'enrolledStudents',
    select: 'name email studentId'
  });

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    count: course.enrolledStudents.length,
    data: course.enrolledStudents
  });
});

// @desc    Get courses for a faculty
// @route   GET /api/courses/faculty/:facultyId
// @access  Private/Faculty/Admin
exports.getCoursesForFaculty = asyncHandler(async (req, res, next) => {
  const faculty = await User.findById(req.params.facultyId);
  
  if (!faculty || faculty.role !== 'faculty') {
    return next(new ErrorResponse(`User with ID ${req.params.facultyId} is not a faculty member`, 400));
  }

  const courses = await Course.find({ faculty: req.params.facultyId });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Get courses for a student
// @route   GET /api/courses/student/:studentId
// @access  Private/Student/Admin
exports.getCoursesForStudent = asyncHandler(async (req, res, next) => {
  const student = await User.findById(req.params.studentId);
  
  if (!student || student.role !== 'student') {
    return next(new ErrorResponse(`User with ID ${req.params.studentId} is not a student`, 400));
  }

  const courses = await Course.find({ enrolledStudents: req.params.studentId })
    .populate({
      path: 'faculty',
      select: 'name email'
    });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

// @desc    Enroll student in course
// @route   POST /api/courses/:courseId/enroll/:studentId
// @access  Private/Admin
exports.enrollStudentInCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  const student = await User.findById(req.params.studentId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  if (!student || student.role !== 'student') {
    return next(new ErrorResponse(`User with ID ${req.params.studentId} is not a student`, 400));
  }

  // Check if course is full
  if (course.enrolledStudents.length >= course.capacity) {
    // Add to waitlist if not already on it
    if (!course.waitlist.includes(req.params.studentId)) {
      course.waitlist.push(req.params.studentId);
      await course.save();
      
      return res.status(200).json({
        success: true,
        message: 'Course is full. Student added to waitlist.',
        data: course
      });
    } else {
      return next(new ErrorResponse('Student is already on the waitlist for this course', 400));
    }
  }

  // Check if student is already enrolled
  if (course.enrolledStudents.includes(req.params.studentId)) {
    return next(new ErrorResponse('Student is already enrolled in this course', 400));
  }

  // Check prerequisites
  if (course.prerequisites && course.prerequisites.length > 0) {
    const studentCourses = await Course.find({ 
      enrolledStudents: req.params.studentId,
      status: 'Completed'
    });
    
    const completedCourseIds = studentCourses.map(c => c._id.toString());
    const missingPrereqs = course.prerequisites.filter(
      prereq => !completedCourseIds.includes(prereq.toString())
    );
    
    if (missingPrereqs.length > 0) {
      return next(new ErrorResponse('Student does not meet all prerequisites for this course', 400));
    }
  }

  course.enrolledStudents.push(req.params.studentId);
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Remove student from course
// @route   DELETE /api/courses/:courseId/enroll/:studentId
// @access  Private/Admin
exports.removeStudentFromCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if student is enrolled
  if (!course.enrolledStudents.includes(req.params.studentId)) {
    return next(new ErrorResponse('Student is not enrolled in this course', 400));
  }

  // Remove student from enrolled students
  course.enrolledStudents = course.enrolledStudents.filter(
    student => student.toString() !== req.params.studentId
  );
  
  // If there's someone on the waitlist, enroll them
  if (course.waitlist.length > 0) {
    const nextStudent = course.waitlist[0];
    course.enrolledStudents.push(nextStudent);
    course.waitlist.shift();
  }
  
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Assign faculty to course
// @route   POST /api/courses/:courseId/assign/:facultyId
// @access  Private/Admin
exports.assignFacultyToCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);
  const faculty = await User.findById(req.params.facultyId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  if (!faculty || faculty.role !== 'faculty') {
    return next(new ErrorResponse(`User with ID ${req.params.facultyId} is not a faculty member`, 400));
  }

  course.faculty = req.params.facultyId;
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});

// @desc    Remove faculty from course
// @route   DELETE /api/courses/:courseId/assign/:facultyId
// @access  Private/Admin
exports.removeFacultyFromCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if this faculty is assigned to the course
  if (course.faculty.toString() !== req.params.facultyId) {
    return next(new ErrorResponse('This faculty is not assigned to this course', 400));
  }

  course.faculty = null;
  await course.save();

  res.status(200).json({
    success: true,
    data: course
  });
});
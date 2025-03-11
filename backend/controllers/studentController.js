const Student = require('../models/Student');
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private/Admin
 */
exports.getAllStudents = asyncHandler(async (req, res, next) => {
  // Implement pagination, filtering, and sorting
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Student.countDocuments();

  // Build query
  let query = Student.find();

  // Filter by department if provided
  if (req.query.department) {
    query = query.find({ department: req.query.department });
  }

  // Filter by status if provided
  if (req.query.status) {
    query = query.find({ status: req.query.status });
  }

  // Sort results
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Select specific fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Execute query with pagination
  const results = await query.skip(startIndex).limit(limit);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: results.length,
    pagination,
    data: results
  });
});

/**
 * @desc    Get single student
 * @route   GET /api/students/:id
 * @access  Private
 */
exports.getStudentById = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Check if user is requesting their own data or is an admin/faculty
  if (req.user.role === 'student' && req.user.id !== req.params.id && req.user.profileId.toString() !== student._id.toString()) {
    return next(new ErrorResponse(`Not authorized to access this resource`, 403));
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Create new student
 * @route   POST /api/students
 * @access  Private/Admin
 */
exports.createStudent = asyncHandler(async (req, res, next) => {
  // Check if student with this email already exists
  const existingStudent = await Student.findOne({ email: req.body.email });

  if (existingStudent) {
    return next(new ErrorResponse(`Student with email ${req.body.email} already exists`, 400));
  }

  // Generate student ID if not provided
  if (!req.body.studentId) {
    req.body.studentId = `STU${Date.now().toString().slice(-6)}`;
  }

  const student = await Student.create(req.body);

  res.status(201).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Update student
 * @route   PUT /api/students/:id
 * @access  Private/Admin
 */
exports.updateStudent = asyncHandler(async (req, res, next) => {
  let student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // If email is being updated, check if it's already in use
  if (req.body.email && req.body.email !== student.email) {
    const existingStudent = await Student.findOne({ email: req.body.email });
    if (existingStudent) {
      return next(new ErrorResponse(`Student with email ${req.body.email} already exists`, 400));
    }
  }

  student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Delete student
 * @route   DELETE /api/students/:id
 * @access  Private/Admin
 */
exports.deleteStudent = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  await student.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get student profile (for logged in student)
 * @route   GET /api/students/profile
 * @access  Private/Student
 */
exports.getStudentProfile = asyncHandler(async (req, res, next) => {
  // Get student profile from user's profileId
  const student = await Student.findById(req.user.profileId)
    .populate('enrolledCourses')
    .populate({
      path: 'attendance',
      populate: {
        path: 'course faculty'
      }
    })
    .populate({
      path: 'assignmentGrades',
      populate: {
        path: 'assignment course gradedBy'
      }
    });

  if (!student) {
    return next(new ErrorResponse('Student profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Register student with user account
 * @route   POST /api/students/register
 * @access  Public
 */
exports.registerStudent = asyncHandler(async (req, res, next) => {
  const { name, email, password, rollNumber, dateOfBirth, gender, contactNumber, address } = req.body;

  // Create student
  const student = await Student.create({
    name,
    rollNumber,
    dateOfBirth,
    gender,
    contactNumber,
    address
  });

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: 'student',
    profileId: student._id
  });

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};

/**
 * @desc    Get students by department
 * @route   GET /api/students/department/:department
 * @access  Private/Admin,Faculty
 */
exports.getStudentByDepartment = asyncHandler(async (req, res, next) => {
  const students = await Student.find({ department: req.params.department });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

/**
 * @desc    Get courses enrolled by student
 * @route   GET /api/students/:id/courses
 * @access  Private/Student
 */
exports.getStudentCourses = asyncHandler(async (req, res, next) => {
  // Check if student exists
  const student = await Student.findById(req.params.id).populate({
    path: 'courses.course',
    select: 'code name description instructor'
  });

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  // Check if user is requesting their own courses or is an admin/faculty
  if (req.user.role === 'student' && req.user.profileId.toString() !== student._id.toString()) {
    return next(new ErrorResponse(`Not authorized to access this resource`, 403));
  }

  res.status(200).json({
    success: true,
    count: student.courses.length,
    data: student.courses
  });
});

/**
 * @desc    Update student status
 * @route   PATCH /api/students/:id/status
 * @access  Private/Admin
 */
exports.updateStudentStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please provide a status', 400));
  }

  // Validate status
  const validStatuses = ['Active', 'Inactive', 'On Leave', 'Graduated'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400));
  }

  let student = await Student.findById(req.params.id);

  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  student = await Student.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Enroll student in a course
 * @route   POST /api/students/:id/enroll/:courseId
 * @access  Private/Admin
 */
exports.enrollStudentInCourse = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if course is full
  if (course.enrolledStudents.length >= course.capacity) {
    return next(new ErrorResponse(`Course ${course.code} is full`, 400));
  }

  // Check if student is already enrolled
  const isEnrolled = student.courses.some(
    enrollment => enrollment.course.toString() === req.params.courseId
  );

  if (isEnrolled) {
    return next(new ErrorResponse(`Student is already enrolled in this course`, 400));
  }

  // Add course to student's courses
  student.courses.push({
    course: req.params.courseId,
    enrollmentDate: new Date(),
    grade: 'Not Graded'
  });

  await student.save();

  // Add student to course's enrolled students
  course.enrolledStudents.push(req.params.id);
  await course.save();

  res.status(200).json({
    success: true,
    data: student
  });
});

/**
 * @desc    Withdraw student from a course
 * @route   DELETE /api/students/:id/withdraw/:courseId
 * @access  Private/Admin
 */
exports.withdrawStudentFromCourse = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.id);
  if (!student) {
    return next(new ErrorResponse(`Student not found with id of ${req.params.id}`, 404));
  }

  const course = await Course.findById(req.params.courseId);
  if (!course) {
    return next(new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404));
  }

  // Check if student is enrolled in the course
  const enrollmentIndex = student.courses.findIndex(
    enrollment => enrollment.course.toString() === req.params.courseId
  );

  if (enrollmentIndex === -1) {
    return next(new ErrorResponse(`Student is not enrolled in this course`, 400));
  }

  // Remove course from student's courses
  student.courses.splice(enrollmentIndex, 1);
  await student.save();

  // Remove student from course's enrolled students
  const studentIndex = course.enrolledStudents.indexOf(req.params.id);
  if (studentIndex !== -1) {
    course.enrolledStudents.splice(studentIndex, 1);
    await course.save();
  }

  res.status(200).json({
    success: true,
    data: student
  });
});

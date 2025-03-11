const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  // Generate ID based on role
  if (user.role === 'student') {
    user.studentId = `STU${Date.now().toString().slice(-6)}`;
  } else if (user.role === 'faculty') {
    user.facultyId = `FAC${Date.now().toString().slice(-6)}`;
  }

  await user.save();

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private/Admin
exports.getStudents = asyncHandler(async (req, res, next) => {
  const students = await User.find({ role: 'student' });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students
  });
});

// @desc    Get all faculty
// @route   GET /api/users/faculty
// @access  Private/Admin
exports.getFaculty = asyncHandler(async (req, res, next) => {
  const faculty = await User.find({ role: 'faculty' });

  res.status(200).json({
    success: true,
    count: faculty.length,
    data: faculty
  });
});

// @desc    Get users by department
// @route   GET /api/users/department/:department
// @access  Private/Admin
exports.getUsersByDepartment = asyncHandler(async (req, res, next) => {
  const users = await User.find({ department: req.params.department });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});
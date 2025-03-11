const Faculty = require('../models/Faculty');
const User = require('../models/User');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all faculty members
 * @route   GET /api/faculty
 * @access  Private/Admin
 */
exports.getAllFaculty = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

/**
 * @desc    Get single faculty member
 * @route   GET /api/faculty/:id
 * @access  Private
 */
exports.getFacultyById = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findById(req.params.id).populate('subjects');

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: faculty
  });
});

/**
 * @desc    Create new faculty member
 * @route   POST /api/faculty
 * @access  Private/Admin
 */
exports.createFaculty = asyncHandler(async (req, res, next) => {
  // Check if faculty with this email already exists
  const existingFaculty = await Faculty.findOne({ email: req.body.email });

  if (existingFaculty) {
    return next(new ErrorResponse(`Faculty with email ${req.body.email} already exists`, 400));
  }

  const faculty = await Faculty.create(req.body);

  res.status(201).json({
    success: true,
    data: faculty
  });
});

/**
 * @desc    Update faculty member
 * @route   PUT /api/faculty/:id
 * @access  Private/Admin
 */
exports.updateFaculty = asyncHandler(async (req, res, next) => {
  let faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  // If email is being updated, check if it's already in use
  if (req.body.email && req.body.email !== faculty.email) {
    const existingFaculty = await Faculty.findOne({ email: req.body.email });
    if (existingFaculty) {
      return next(new ErrorResponse(`Faculty with email ${req.body.email} already exists`, 400));
    }
  }

  faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: faculty
  });
});

/**
 * @desc    Delete faculty member
 * @route   DELETE /api/faculty/:id
 * @access  Private/Admin
 */
exports.deleteFaculty = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  // Check if faculty is assigned to any courses
  const assignedCourses = await Course.find({ instructor: req.params.id });
  
  if (assignedCourses.length > 0) {
    return next(
      new ErrorResponse(
        `Cannot delete faculty as they are assigned to ${assignedCourses.length} courses. Reassign courses first.`,
        400
      )
    );
  }

  await faculty.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Get faculty members by department
 * @route   GET /api/faculty/department/:department
 * @access  Private/Admin,Faculty
 */
exports.getFacultyByDepartment = asyncHandler(async (req, res, next) => {
  const faculty = await Faculty.find({ department: req.params.department });

  res.status(200).json({
    success: true,
    count: faculty.length,
    data: faculty
  });
});

/**
 * @desc    Get courses taught by faculty
 * @route   GET /api/faculty/:id/courses
 * @access  Private/Faculty
 */
exports.getFacultyCourses = asyncHandler(async (req, res, next) => {
  // Check if faculty exists
  const faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  // Check if user is requesting their own courses or is an admin
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new ErrorResponse(`Not authorized to access this resource`, 403));
  }

  const courses = await Course.find({ instructor: req.params.id });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});

/**
 * @desc    Get faculty profile (for logged in faculty)
 * @route   GET /api/faculty/profile
 * @access  Private/Faculty
 */
exports.getFacultyProfile = asyncHandler(async (req, res, next) => {
  // Get faculty profile from user's profileId
  const faculty = await Faculty.findById(req.user.profileId).populate('subjects');

  if (!faculty) {
    return next(new ErrorResponse('Faculty profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: faculty
  });
});

/**
 * @desc    Update faculty status
 * @route   PATCH /api/faculty/:id/status
 * @access  Private/Admin
 */
exports.updateFacultyStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!status) {
    return next(new ErrorResponse('Please provide a status', 400));
  }

  // Validate status
  const validStatuses = ['Active', 'On Leave', 'Sabbatical'];
  if (!validStatuses.includes(status)) {
    return next(new ErrorResponse(`Status must be one of: ${validStatuses.join(', ')}`, 400));
  }

  let faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  faculty = await Faculty.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: faculty
  });
});

/**
 * @desc    Get assignments created by faculty
 * @route   GET /api/faculty/:id/assignments
 * @access  Private
 */
exports.getFacultyAssignments = asyncHandler(async (req, res, next) => {
  // Check if faculty exists
  const faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  // Check if user is requesting their own assignments or is an admin
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return next(new ErrorResponse(`Not authorized to access this resource`, 403));
  }

  // For now, return empty array since Assignment model might not be set up yet
  res.status(200).json({
    success: true,
    count: 0,
    data: []
  });
});

/**
 * @desc    Update faculty workload
 * @route   PATCH /api/faculty/:id/workload
 * @access  Private/Admin
 */
exports.updateFacultyWorkload = asyncHandler(async (req, res, next) => {
  const { teachingHours, researchHours, administrativeHours } = req.body;

  if (!teachingHours && !researchHours && !administrativeHours) {
    return next(new ErrorResponse('Please provide at least one workload parameter to update', 400));
  }

  let faculty = await Faculty.findById(req.params.id);

  if (!faculty) {
    return next(new ErrorResponse(`Faculty not found with id of ${req.params.id}`, 404));
  }

  const updateData = {};
  if (teachingHours !== undefined) updateData.teachingHours = teachingHours;
  if (researchHours !== undefined) updateData.researchHours = researchHours;
  if (administrativeHours !== undefined) updateData.administrativeHours = administrativeHours;

  faculty = await Faculty.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: faculty
  });
});

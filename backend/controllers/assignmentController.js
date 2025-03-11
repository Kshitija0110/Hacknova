const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all assignments
// @route   GET /api/assignments
// @route   GET /api/courses/:courseId/assignments
// @access  Private
exports.getAssignments = asyncHandler(async (req, res, next) => {
  if (req.params.courseId) {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate({
        path: 'faculty',
        select: 'name facultyId'
      });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate({
      path: 'course',
      select: 'name courseCode'
    })
    .populate({
      path: 'faculty',
      select: 'name facultyId'
    });

  if (!assignment) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Create new assignment
// @route   POST /api/assignments
// @route   POST /api/courses/:courseId/assignments
// @access  Private/Faculty
exports.createAssignment = asyncHandler(async (req, res, next) => {
  // Set course ID from params if available
  if (req.params.courseId) {
    req.body.course = req.params.courseId;
  }
  
  // Set faculty ID from authenticated user if not provided
  if (!req.body.faculty) {
    req.body.faculty = req.user.profileId;
  }
  
  // Set createdBy field
  req.body.createdBy = req.user.id;

  // Check if course exists
  const course = await Course.findById(req.body.course);
  
  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.body.course}`, 404)
    );
  }

  // Check if faculty is authorized to create assignment for this course
  if (req.user.role === 'faculty') {
    const faculty = await Faculty.findById(req.user.profileId);
    const courseIds = faculty.subjects.map(subject => subject.toString());
    
    if (!courseIds.includes(req.body.course) && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to create assignment for this course`, 401)
      );
    }
  }

  const assignment = await Assignment.create(req.body);

  res.status(201).json({
    success: true,
    data: assignment
  });
});

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Faculty
exports.updateAssignment = asyncHandler(async (req, res, next) => {
  let assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to update this assignment
  // Either admin, or the faculty who created it
  if (
    req.user.role !== 'admin' && 
    (
      (req.user.role === 'faculty' && req.user.profileId.toString() !== assignment.faculty.toString()) ||
      (assignment.createdBy && assignment.createdBy.toString() !== req.user.id)
    )
  ) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this assignment`, 401)
    );
  }

  // Don't allow changing course or faculty
  delete req.body.course;
  delete req.body.faculty;
  delete req.body.createdBy;

  assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: assignment
  });
});

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Faculty
exports.deleteAssignment = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to delete this assignment
  // Either admin, or the faculty who created it
  if (
    req.user.role !== 'admin' && 
    (
      (req.user.role === 'faculty' && req.user.profileId.toString() !== assignment.faculty.toString()) ||
      (assignment.createdBy && assignment.createdBy.toString() !== req.user.id)
    )
  ) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to delete this assignment`, 401)
    );
  }

  await assignment.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});


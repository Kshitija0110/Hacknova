const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all submissions
// @route   GET /api/submissions
// @route   GET /api/assignments/:assignmentId/submissions
// @access  Private
exports.getSubmissions = asyncHandler(async (req, res, next) => {
  if (req.params.assignmentId) {
    const assignment = await Assignment.findById(req.params.assignmentId);
    
    if (!assignment) {
      return next(
        new ErrorResponse(`Assignment not found with id of ${req.params.assignmentId}`, 404)
      );
    }
    
    // For students, only show their own submissions
    if (req.user.role === 'student') {
      const submissions = await Submission.find({
        assignment: req.params.assignmentId,
        student: req.user.id
      }).populate({
        path: 'student',
        select: 'name email studentId'
      });
      
      return res.status(200).json({
        success: true,
        count: submissions.length,
        data: submissions
      });
    }
    
    // For faculty and admin, show all submissions for the assignment
    const course = await Course.findById(assignment.course);
    
    // Make sure user is course faculty or admin
    if (
      req.user.role !== 'admin' &&
      course.faculty.toString() !== req.user.id
    ) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view submissions for this assignment`,
          401
        )
      );
    }
    
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate({
        path: 'student',
        select: 'name email studentId'
      });
    
    return res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } else {
    // Only admin can see all submissions
    if (req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view all submissions`,
          401
        )
      );
    }
    
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single submission
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id)
    .populate({
      path: 'student',
      select: 'name email studentId'
    })
    .populate({
      path: 'assignment',
      select: 'title dueDate points course'
    });

  if (!submission) {
    return next(
      new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404)
    );
  }

  // Students can only view their own submissions
  if (
    req.user.role === 'student' &&
    submission.student._id.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to view this submission`,
        401
      )
    );
  }

  // Faculty can only view submissions for their courses
  if (req.user.role === 'faculty') {
    const assignment = await Assignment.findById(submission.assignment);
    const course = await Course.findById(assignment.course);
    
    if (course.faculty.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view this submission`,
          401
        )
      );
    }
  }

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Create submission
// @route   POST /api/assignments/:assignmentId/submissions
// @access  Private/Student
exports.createSubmission = asyncHandler(async (req, res, next) => {
  req.body.assignment = req.params.assignmentId;
  req.body.student = req.user.id;

  const assignment = await Assignment.findById(req.params.assignmentId);

  if (!assignment) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.assignmentId}`, 404)
    );
  }

  // Check if assignment due date has passed
  if (new Date() > new Date(assignment.dueDate)) {
    req.body.status = 'late';
  }

  // Check if student is enrolled in the course
  const course = await Course.findById(assignment.course);
  
  if (!course.enrolledStudents.includes(req.user.id)) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not enrolled in this course and cannot submit`,
        401
      )
    );
  }

  // Check if student has already submitted
  const existingSubmission = await Submission.findOne({
    assignment: req.params.assignmentId,
    student: req.user.id
  });

  if (existingSubmission) {
    return next(
      new ErrorResponse(
        `You have already submitted for this assignment. Please update your existing submission.`,
        400
      )
    );
  }

  const submission = await Submission.create(req.body);

  res.status(201).json({
    success: true,
    data: submission
  });
});

// @desc    Update submission
// @route   PUT /api/submissions/:id
// @access  Private/Student
exports.updateSubmission = asyncHandler(async (req, res, next) => {
  let submission = await Submission.findById(req.params.id);

  if (!submission) {
    return next(
      new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is submission owner
  if (submission.student.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this submission`,
        401
      )
    );
  }

  // Check if submission is already graded
  if (submission.grade && submission.grade.score !== undefined) {
    return next(
      new ErrorResponse(
        `Cannot update submission after it has been graded`,
        400
      )
    );
  }

  // Check if assignment due date has passed
  const assignment = await Assignment.findById(submission.assignment);
  if (new Date() > new Date(assignment.dueDate)) {
    req.body.status = 'late';
  }

  submission = await Submission.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private/Faculty/Admin
exports.gradeSubmission = asyncHandler(async (req, res, next) => {
  let submission = await Submission.findById(req.params.id);

  if (!submission) {
    return next(
      new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is faculty for the course or admin
  const assignment = await Assignment.findById(submission.assignment);
  const course = await Course.findById(assignment.course);

  if (
    req.user.role !== 'admin' &&
    course.faculty.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to grade this submission`,
        401
      )
    );
  }

  // Validate score is within assignment points
  if (req.body.score > assignment.points) {
    return next(
      new ErrorResponse(
        `Score cannot exceed maximum points (${assignment.points}) for this assignment`,
        400
      )
    );
  }

  // Update grade
  submission = await Submission.findByIdAndUpdate(
    req.params.id,
    {
      grade: {
        score: req.body.score,
        feedback: req.body.feedback,
        gradedBy: req.user.id,
        gradedAt: Date.now()
      },
      status: 'graded'
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).json({
    success: true,
    data: submission
  });
});

// @desc    Delete submission
// @route   DELETE /api/submissions/:id
// @access  Private/Admin
exports.deleteSubmission = asyncHandler(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    return next(
      new ErrorResponse(`Submission not found with id of ${req.params.id}`, 404)
    );
  }

  // Only admin can delete submissions
  if (req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete submissions`,
        401
      )
    );
  }

  await submission.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
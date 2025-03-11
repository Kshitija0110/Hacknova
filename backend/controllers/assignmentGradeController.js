const AssignmentGrade = require('../models/AssignmentGrade');
const Assignment = require('../models/Assignment');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all assignment grades
// @route   GET /api/grades
// @access  Private/Admin
exports.getAssignmentGrades = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single assignment grade
// @route   GET /api/grades/:id
// @access  Private
exports.getAssignmentGrade = asyncHandler(async (req, res, next) => {
  const grade = await AssignmentGrade.findById(req.params.id)
    .populate({
      path: 'student',
      select: 'name rollNumber'
    })
    .populate({
      path: 'assignment',
      select: 'title assignmentNumber totalMarks'
    })
    .populate({
      path: 'course',
      select: 'name courseCode'
    })
    .populate({
      path: 'gradedBy',
      select: 'name facultyId'
    });

  if (!grade) {
    return next(
      new ErrorResponse(`Assignment grade not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to view this grade
  if (req.user.role === 'student' && req.user.profileId.toString() !== grade.student._id.toString()) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to view this grade`, 401)
    );
  }

  if (req.user.role === 'faculty' && req.user.profileId.toString() !== grade.gradedBy._id.toString()) {
    // Check if faculty teaches this course
    const faculty = await Faculty.findById(req.user.profileId);
    const courseIds = faculty.subjects.map(subject => subject.toString());
    
    if (!courseIds.includes(grade.course._id.toString())) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to view this grade`, 401)
      );
    }
  }

  res.status(200).json({
    success: true,
    data: grade
  });
});

// @desc    Create new assignment grade
// @route   POST /api/grades
// @access  Private/Faculty
exports.createAssignmentGrade = asyncHandler(async (req, res, next) => {
  // Check if faculty is authorized to grade this assignment
  const assignment = await Assignment.findById(req.body.assignment);
  
  if (!assignment) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.body.assignment}`, 404)
    );
  }

  // Set the course from the assignment
  req.body.course = assignment.course;

  // Set the faculty ID from the authenticated user
  req.body.gradedBy = req.user.profileId;

  // Check if faculty teaches this course
  const faculty = await Faculty.findById(req.user.profileId);
  const courseIds = faculty.subjects.map(subject => subject.toString());
  
  if (!courseIds.includes(assignment.course.toString()) && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to grade assignments for this course`, 401)
    );
  }

  // Check if student exists
  const student = await Student.findById(req.body.student);
  
  if (!student) {
    return next(
      new ErrorResponse(`Student not found with id of ${req.body.student}`, 404)
    );
  }

  // Check if grade already exists
  const existingGrade = await AssignmentGrade.findOne({
    student: req.body.student,
    assignment: req.body.assignment
  });

  if (existingGrade) {
    return next(
      new ErrorResponse(`Grade already exists for this student and assignment`, 400)
    );
  }

  // Validate grade is within range
  if (req.body.grade < 0 || req.body.grade > assignment.totalMarks) {
    return next(
      new ErrorResponse(`Grade must be between 0 and ${assignment.totalMarks}`, 400)
    );
  }

  const grade = await AssignmentGrade.create(req.body);

  res.status(201).json({
    success: true,
    data: grade
  });
});

// @desc    Update assignment grade
// @route   PUT /api/grades/:id
// @access  Private/Faculty
exports.updateAssignmentGrade = asyncHandler(async (req, res, next) => {
  let grade = await AssignmentGrade.findById(req.params.id);

  if (!grade) {
    return next(
      new ErrorResponse(`Assignment grade not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if faculty is authorized to update this grade
  if (req.user.role === 'faculty' && req.user.profileId.toString() !== grade.gradedBy.toString()) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to update this grade`, 401)
    );
  }

  // If grade is being updated, validate it's within range
  if (req.body.grade !== undefined) {
    const assignment = await Assignment.findById(grade.assignment);
    
    if (req.body.grade < 0 || req.body.grade > assignment.totalMarks) {
      return next(
        new ErrorResponse(`Grade must be between 0 and ${assignment.totalMarks}`, 400)
      );
    }
  }

  // Don't allow changing student or assignment
  delete req.body.student;
  delete req.body.assignment;
  delete req.body.course;

  // Update the grade
  grade = await AssignmentGrade.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: grade
  });
});

// @desc    Delete assignment grade
// @route   DELETE /api/grades/:id
// @access  Private/Admin
exports.deleteAssignmentGrade = asyncHandler(async (req, res, next) => {
  const grade = await AssignmentGrade.findById(req.params.id);

  if (!grade) {
    return next(
      new ErrorResponse(`Assignment grade not found with id of ${req.params.id}`, 404)
    );
  }

  await grade.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get grades for a specific student
// @route   GET /api/students/:studentId/grades
// @access  Private
exports.getStudentGrades = asyncHandler(async (req, res, next) => {
  const student = await Student.findById(req.params.studentId);

  if (!student) {
    return next(
      new ErrorResponse(`Student not found with id of ${req.params.studentId}`, 404)
    );
  }

  // Check if user is authorized to view these grades
  if (req.user.role === 'student' && req.user.profileId.toString() !== req.params.studentId) {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorized to view these grades`, 401)
    );
  }

  const grades = await AssignmentGrade.find({ student: req.params.studentId })
    .populate({
      path: 'assignment',
      select: 'title assignmentNumber totalMarks dueDate',
      populate: {
        path: 'course',
        select: 'name courseCode'
      }
    })
    .populate({
      path: 'gradedBy',
      select: 'name facultyId'
    });

  res.status(200).json({
    success: true,
    count: grades.length,
    data: grades
  });
});

// @desc    Get grades for a specific assignment
// @route   GET /api/assignments/:assignmentId/grades
// @access  Private/Faculty
exports.getAssignmentGrades = asyncHandler(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.assignmentId);

  if (!assignment) {
    return next(
      new ErrorResponse(`Assignment not found with id of ${req.params.assignmentId}`, 404)
    );
  }

  // Check if faculty is authorized to view these grades
  if (req.user.role === 'faculty') {
    const faculty = await Faculty.findById(req.user.profileId);
    const courseIds = faculty.subjects.map(subject => subject.toString());
    
    if (!courseIds.includes(assignment.course.toString())) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to view these grades`, 401)
      );
    }
  }

  const grades = await AssignmentGrade.find({ assignment: req.params.assignmentId })
    .populate({
      path: 'student',
      select: 'name rollNumber'
    })
    .populate({
      path: 'gradedBy',
      select: 'name facultyId'
    });

  res.status(200).json({
    success: true,
    count: grades.length,
    data: grades
  });
});

// @desc    Get grades for a specific course
// @route   GET /api/courses/:courseId/grades
// @access  Private
exports.getCourseGrades = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404)
    );
  }

  // Check if user is authorized to view these grades
  if (req.user.role === 'faculty') {
    const faculty = await Faculty.findById(req.user.profileId);
    const courseIds = faculty.subjects.map(subject => subject.toString());
    
    if (!courseIds.includes(req.params.courseId)) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to view these grades`, 401)
      );
    }
  }

  if (req.user.role === 'student') {
    const student = await Student.findById(req.user.profileId);
    const enrolledCourseIds = student.enrolledCourses.map(course => course.toString());
    
    if (!enrolledCourseIds.includes(req.params.courseId)) {
      return next(
        new ErrorResponse(`User ${req.user.id} is not authorized to view these grades`, 401)
      );
    }
  }

  const grades = await AssignmentGrade.find({ course: req.params.courseId })
    .populate({
      path: 'student',
      select: 'name rollNumber'
    })
    .populate({
      path: 'assignment',
      select: 'title assignmentNumber totalMarks'
    })
    .populate({
      path: 'gradedBy',
      select: 'name facultyId'
    });

  res.status(200).json({
    success: true,
    count: grades.length,
    data: grades
  });
});
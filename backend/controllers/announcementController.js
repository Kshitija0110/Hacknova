const Announcement = require('../models/Announcement');
const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all announcements
// @route   GET /api/announcements
// @route   GET /api/courses/:courseId/announcements
// @access  Private
exports.getAnnouncements = asyncHandler(async (req, res, next) => {
  if (req.params.courseId) {
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404)
      );
    }
    
    // Check if user is enrolled in the course or is faculty/admin
    const isEnrolled = course.enrolledStudents.includes(req.user.id);
    const isFaculty = course.faculty.toString() === req.user.id;
    
    if (!isEnrolled && !isFaculty && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view announcements for this course`,
          401
        )
      );
    }
    
    const announcements = await Announcement.find({ 
      course: req.params.courseId,
      status: 'published'
    }).populate({
      path: 'faculty',
      select: 'name email'
    });
    
    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  } else {
    // For admin, show all announcements
    if (req.user.role === 'admin') {
      return res.status(200).json(res.advancedResults);
    }
    
    // For faculty, show their announcements
    if (req.user.role === 'faculty') {
      const announcements = await Announcement.find({ faculty: req.user.id })
        .populate({
          path: 'course',
          select: 'name courseCode'
        });
      
      return res.status(200).json({
        success: true,
        count: announcements.length,
        data: announcements
      });
    }
    
    // For students, show announcements for their enrolled courses
    const enrolledCourses = await Course.find({ enrolledStudents: req.user.id });
    const courseIds = enrolledCourses.map(course => course._id);
    
    const announcements = await Announcement.find({
      course: { $in: courseIds },
      status: 'published'
    }).populate({
      path: 'course',
      select: 'name courseCode'
    }).populate({
      path: 'faculty',
      select: 'name email'
    });
    
    return res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements
    });
  }
});

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
exports.getAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id)
    .populate({
      path: 'faculty',
      select: 'name email'
    })
    .populate({
      path: 'course',
      select: 'name courseCode enrolledStudents faculty'
    });

  if (!announcement) {
    return next(
      new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is authorized to view this announcement
  if (req.user.role !== 'admin') {
    // If course-specific announcement
    if (announcement.course) {
      const isEnrolled = announcement.course.enrolledStudents.includes(req.user.id);
      const isFaculty = announcement.course.faculty.toString() === req.user.id;
      
      if (!isEnrolled && !isFaculty) {
        return next(
          new ErrorResponse(
            `User ${req.user.id} is not authorized to view this announcement`,
            401
          )
        );
      }
    }
    // If faculty-specific and not the creator
    else if (announcement.targetAudience === 'faculty' && req.user.role !== 'faculty') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to view this announcement`,
          401
        )
      );
    }
  }

  // Mark announcement as read if not already read by this user
  if (!announcement.readBy.some(read => read.user.toString() === req.user.id)) {
    announcement.readBy.push({ user: req.user.id });
    await announcement.save();
  }

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Create new announcement
// @route   POST /api/announcements
// @route   POST /api/courses/:courseId/announcements
// @access  Private/Faculty/Admin
exports.createAnnouncement = asyncHandler(async (req, res, next) => {
  // Set faculty to current user
  req.body.faculty = req.user.id;
  
  // If course ID is provided in the route
  if (req.params.courseId) {
    req.body.course = req.params.courseId;
    req.body.targetAudience = 'specific-course';
    
    const course = await Course.findById(req.params.courseId);
    
    if (!course) {
      return next(
        new ErrorResponse(`Course not found with id of ${req.params.courseId}`, 404)
      );
    }
    
    // Check if user is faculty for this course or admin
    if (req.user.role !== 'admin' && course.faculty.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to create announcements for this course`,
          401
        )
      );
    }
  }
  
  // Only faculty and admin can create announcements
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User role ${req.user.role} is not authorized to create announcements`,
        401
      )
    );
  }
  
  const announcement = await Announcement.create(req.body);
  
  res.status(201).json({
    success: true,
    data: announcement
  });
});

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private/Faculty/Admin
exports.updateAnnouncement = asyncHandler(async (req, res, next) => {
  let announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(
      new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is announcement creator or admin
  if (
    req.user.role !== 'admin' &&
    announcement.faculty.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this announcement`,
        401
      )
    );
  }

  announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: announcement
  });
});

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Faculty/Admin
exports.deleteAnnouncement = asyncHandler(async (req, res, next) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    return next(
      new ErrorResponse(`Announcement not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is announcement creator or admin
  if (
    req.user.role !== 'admin' &&
    announcement.faculty.toString() !== req.user.id
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this announcement`,
        401
      )
    );
  }

  await announcement.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});
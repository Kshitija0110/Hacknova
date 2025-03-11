const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: [true, 'Please provide course code'],
    unique: true,
    trim: true,
    maxlength: [20, 'Course code cannot be more than 20 characters']
  },
  name: {
    type: String,
    required: [true, 'Please provide course name'],
    trim: true,
    maxlength: [50, 'Course name cannot be more than 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  department: {
    type: String,
    required: [true, 'Please provide department'],
    enum: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Medicine', 'Other']
  },
  credits: {
    type: Number,
    required: [true, 'Please provide course credits'],
    min: [1, 'Credits must be at least 1'],
    max: [6, 'Credits cannot be more than 6']
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Faculty is required']
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: String,
    endTime: String,
    location: String
  },
  capacity: {
    type: Number,
    required: [true, 'Course capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  waitlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  semester: {
    term: {
      type: String,
      enum: ['Fall', 'Spring', 'Summer', 'Winter']
    },
    year: Number
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Cancelled', 'Completed'],
    default: 'Active'
  },
  syllabus: {
    type: String,
    maxlength: [5000, 'Syllabus cannot be more than 5000 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if course is full
courseSchema.virtual('isFull').get(function() {
  return this.enrolledStudents.length >= this.capacity;
});

// Virtual for available seats
courseSchema.virtual('availableSeats').get(function() {
  return Math.max(0, this.capacity - this.enrolledStudents.length);
});

// Virtual for enrollment count
courseSchema.virtual('enrollmentCount').get(function() {
  return this.enrolledStudents.length;
});

// Virtual for waitlist count
courseSchema.virtual('waitlistCount').get(function() {
  return this.waitlist.length;
});

module.exports = mongoose.model('Course', courseSchema);

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Student ID is required'],
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Medicine', 'Other']
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  graduationYear: {
    type: Number
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Graduated'],
    default: 'Active'
  },
  contactNumber: {
    type: String,
    trim: true
  },
  address: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say']
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting all attendance records for this student
studentSchema.virtual('attendance', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'student',
  justOne: false
});

// Virtual for getting all assignment grades for this student
studentSchema.virtual('assignmentGrades', {
  ref: 'AssignmentGrade',
  localField: '_id',
  foreignField: 'student',
  justOne: false
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;

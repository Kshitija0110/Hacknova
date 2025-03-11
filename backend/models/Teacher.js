const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide teacher name']
  },
  teacherId: {
    type: String,
    required: [true, 'Please provide teacher ID'],
    unique: true
  },
  department: {
    type: String,
    required: [true, 'Please provide department']
  },
  designation: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  contactNumber: {
    type: String
  },
  address: {
    type: String
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting all attendance records managed by this teacher
TeacherSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'teacher',
  justOne: false
});

// Virtual for getting all assignments created by this teacher
TeacherSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'teacher',
  justOne: false
});

module.exports = mongoose.model('Teacher', TeacherSchema);
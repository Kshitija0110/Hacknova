const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  subjectCode: {
    type: String,
    required: [true, 'Please provide subject code'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Please provide subject name'],
    trim: true
  },
  description: {
    type: String
  },
  credits: {
    type: Number,
    required: [true, 'Please provide subject credits']
  },
  department: {
    type: String,
    required: [true, 'Please provide department']
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting all assignments for this subject
SubjectSchema.virtual('assignments', {
  ref: 'Assignment',
  localField: '_id',
  foreignField: 'subject',
  justOne: false
});

// Virtual for getting all attendance records for this subject
SubjectSchema.virtual('attendanceRecords', {
  ref: 'Attendance',
  localField: '_id',
  foreignField: 'subject',
  justOne: false
});

module.exports = mongoose.model('Subject', SubjectSchema);
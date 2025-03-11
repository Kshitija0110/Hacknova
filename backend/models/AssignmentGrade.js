const mongoose = require('mongoose');

const AssignmentGradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  grade: {
    type: Number,
    required: true
  },
  feedback: {
    type: String
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure a student can only have one grade per assignment
AssignmentGradeSchema.index({ student: 1, assignment: 1 }, { unique: true });

module.exports = mongoose.model('AssignmentGrade', AssignmentGradeSchema);

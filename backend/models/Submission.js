const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submissionText: {
    type: String
  },
  attachments: [{
    fileName: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  grade: {
    score: {
      type: Number,
      min: [0, 'Grade cannot be less than 0']
    },
    feedback: String,
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gradedAt: Date
  },
  status: {
    type: String,
    enum: ['submitted', 'late', 'graded', 'returned'],
    default: 'submitted'
  }
});

// Set status to 'late' if submitted after due date
SubmissionSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }

  try {
    const Assignment = this.model('Assignment');
    const assignment = await Assignment.findById(this.assignment);
    
    if (assignment && this.submittedAt > assignment.dueDate) {
      this.status = 'late';
    }
    
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Submission', SubmissionSchema);
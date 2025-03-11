const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide announcement title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide announcement content']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
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
  targetAudience: {
    type: String,
    enum: ['all', 'students', 'faculty', 'specific-course'],
    default: 'all'
  },
  visibleFrom: {
    type: Date,
    default: Date.now
  },
  visibleUntil: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'published'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
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

// Virtual for checking if announcement is active
AnnouncementSchema.virtual('isActive').get(function() {
  const now = new Date();
  return (
    this.status === 'published' &&
    (!this.visibleFrom || this.visibleFrom <= now) &&
    (!this.visibleUntil || this.visibleUntil >= now)
  );
});

// Virtual for read count
AnnouncementSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Index for efficient querying
AnnouncementSchema.index({ course: 1, createdAt: -1 });
AnnouncementSchema.index({ faculty: 1, createdAt: -1 });
AnnouncementSchema.index({ status: 1, visibleFrom: 1, visibleUntil: 1 });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
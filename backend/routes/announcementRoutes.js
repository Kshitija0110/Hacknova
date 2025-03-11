const express = require('express');
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} = require('../controllers/announcementController');

const Announcement = require('../models/Announcement');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Merging params allows access to params from parent router
const router = express.Router({ mergeParams: true });

// Protect all routes
router.use(protect);

router.route('/')
  .get(
    advancedResults(
      Announcement,
      [
        { path: 'faculty', select: 'name email' },
        { path: 'course', select: 'name courseCode' }
      ]
    ),
    getAnnouncements
  )
  .post(authorize('faculty', 'admin'), createAnnouncement);

router.route('/:id')
  .get(getAnnouncement)
  .put(authorize('faculty', 'admin'), updateAnnouncement)
  .delete(authorize('faculty', 'admin'), deleteAnnouncement);

module.exports = router;
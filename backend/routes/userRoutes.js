const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getStudents,
  getFaculty,
  getUsersByDepartment
} = require('../controllers/userController');

const User = require('../models/User');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Apply protection to all routes
router.use(protect);
// Apply authorization to all routes
router.use(authorize('admin'));

router.route('/students')
  .get(getStudents);

router.route('/faculty')
  .get(getFaculty);

router.route('/department/:department')
  .get(getUsersByDepartment);

router.route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router;
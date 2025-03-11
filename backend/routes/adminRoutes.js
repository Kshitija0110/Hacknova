const express = require('express');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(protect);
router.use(authorize('admin'));

// Simple dashboard route
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin dashboard',
    data: {
      stats: {
        students: 0,
        faculty: 0,
        courses: 0
      }
    }
  });
});

// Simple users route
router.get('/users', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin users',
    data: []
  });
});

// Simple departments route
router.get('/departments', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Admin departments',
    data: []
  });
});

// Simple academic years route
router.get('/academic-years', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Academic years',
    data: []
  });
});

module.exports = router;

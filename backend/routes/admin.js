const express = require('express');
const {
  getDashboardStats,
  getSystemLogs,
  getSystemHealth,
  backupDatabase,
  restoreDatabase,
  createAcademicYear,
  updateAcademicYear,
  getAcademicYears,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartments
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Use authentication middleware for all routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard and system routes
router.get('/dashboard', getDashboardStats);
router.get('/logs', getSystemLogs);
router.get('/health', getSystemHealth);

// Database management
router.post('/backup', backupDatabase);
router.post('/restore', restoreDatabase);

// Academic year management
router.route('/academic-years')
  .get(getAcademicYears)
  .post(createAcademicYear);

router.route('/academic-years/:id')
  .put(updateAcademicYear);

// Department management
router.route('/departments')
  .get(getDepartments)
  .post(createDepartment);

router.route('/departments/:id')
  .put(updateDepartment)
  .delete(deleteDepartment);

module.exports = router;
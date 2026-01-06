const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/auth');

// Route Pagination
router.get('/', dashboardController.getDashboardData);

// Route Non-pagination
router.get('/all', dashboardController.getAllDashboardData);

module.exports = router;

const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboard');

const permissionController = require('../controllers/permission');


// Dashboard home
router.get('/',
  permissionController.isAuthenticated,
  dashboardController.home);

// Dashboard projects
router.get('/projects',
  permissionController.isAuthenticated,
  dashboardController.projects);

// Dashboard milestones
router.get('/milestones',
  permissionController.isAuthenticated,
  dashboardController.milestones);


module.exports = router;



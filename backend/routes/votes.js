const express = require('express');
const router = express.Router();

const votesController = require('../controllers/votes');
const permissionController = require('../controllers/permission');

//Mostrar protipo de votaciones
router.get('/:projectId(\\d+)/votations',
  permissionController.isAuthenticated, 
    votesController.viewVotes);

//Procesar votaciones
router.post('/:projectId(\\d+)/submit',
  permissionController.isAuthenticated, 
    votesController.submitVotes);

module.exports = router;
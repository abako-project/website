const express = require('express');
const router = express.Router();

const votesController = require('../controllers/votes');
const permissionController = require('../controllers/permission');

//Mostrar protipo de votaciones
router.get('/:projectId/votations',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({projectConsultant: true}),
    votesController.viewVotes);

//Procesar votaciones
router.post('/:projectId/votations',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({projectConsultant: true}),
    votesController.submitVotes);

module.exports = router;
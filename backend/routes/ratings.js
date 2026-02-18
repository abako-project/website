const express = require('express');
const router = express.Router();

const votesController = require('../controllers/votes');
const permissionController = require('../controllers/permission');

// ==== Client evaluates Consultant ===

// Panel para que el cliente valore al consultor:
router.get('/:projectId/clientRating',
    permissionController.isAuthenticated,
    permissionController.projectClientRequired,
    votesController.clientRating);

// Cliente envia su valoracion
router.post('/:projectId/clientRating',
    permissionController.isAuthenticated,
    permissionController.projectClientRequired,
    votesController.submitClientRating);

// ==== Consultant evaluates Client and Develpers ====

// Panel para que el consultor valore al cliente y a los desarrolladores de los milestones:
router.get('/:projectId/consultantRatings',
    permissionController.isAuthenticated,
    permissionController.projectConsultantRequired,
    votesController.consultantRatings);

// Consultor envia sus valoraciones
router.post('/:projectId/consultantRatings',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({projectConsultant: true}),
    votesController.submitConsultantRatings);

// ==== Developer evaluates Consultant ====

// Panel para que el developer de un milestone  valore al consultor:
router.get('/:projectId/developerRating',
    permissionController.isAuthenticated,
    permissionController.projectDeveloperRequired,
    votesController.developerRating);

// Developer envia su valoracion
router.post('/:projectId/developerRating',
    permissionController.isAuthenticated,
    permissionController.projectDeveloperRequired,
    votesController.submitDeveloperRating);

// ========

/*
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
*/

module.exports = router;
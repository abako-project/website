const express = require('express');
const router = express.Router();

const projectController = require('../controllers/project');
const objectiveController = require('../controllers/objective');
const constraintController = require('../controllers/constraint');
const milestoneController = require('../controllers/milestone');
const escrowController = require('../controllers/escrow');

const permissionController = require('../controllers/permission');


// Listar todos los proyectos, los de un cliente, o los de un developer
// Virto
router.get('/',
  permissionController.isAuthenticated,
    projectController.index);

// Mostrar formulario de creación de una proyecto (o propuesta)
router.get('/new',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  projectController.newProposal);

// Crear proyecto (o propuesta)
router.post('/',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  projectController.createProposal);

// Mostrar detalles de un proyecto (o propuesta)
router.get('/:projectId',
  permissionController.isAuthenticated,
    projectController.show);

// Mostrar la pantalla que ofrece publicar  (submit) una propuesta nueva o rechazada
router.get('/:projectId/submit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  projectController.submit);

// Mostrar formulario de edición de una propuesta
router.get('/:projectId/edit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  projectController.editProposal);

// Actualizar propuesta
router.put('/:projectId',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  projectController.updateProposal);

// Eliminar proyecto
router.delete('/:projectId',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({admin: true}),
    projectController.destroy);

// Publicar la propuesta: estado = ProposalPending
router.put('/:projectId/proposal_submit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  projectController.proposalSubmit);

// Rechazar el proyecto: estado inicial = WaitingForProposalApproval
router.put('/:projectId/proposal_reject',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({projectConsultant: true}),
  projectController.rejectProposal);

// Aprobar el proyecto: estado inicial = WaitingForProposalApproval
router.put('/:projectId/proposal_approve',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({projectConsultant: true}),
  projectController.approveProposal);

// Publicar el scope: estado = ScopeValidationNeeded
router.put('/:projectId/scopeSubmit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({projectConsultant: true}),
  projectController.scopeSubmit);

// Aprobar el scope del proyecto: estado =
router.put('/:projectId/scopeAccept',
  permissionController.isAuthenticated,
  permissionController.projectClientRequired,
  // Falta comprobar estado
  projectController.scopeAccept);

// Rechazar el scope del proyecto: estado = ScopingInProgress
router.put('/:projectId/scopeReject',
  permissionController.isAuthenticated,
  permissionController.projectClientRequired,
  // Falta comprobar estado
  projectController.scopeReject);

// === Objetivos y Constraints

// Mostrar formulario para editar Objetivos y Coonstraints
router.get('/:projectId/objectives_constraints/edit',
  permissionController.isAuthenticated,
  projectController.editObjectivesConstraints);


// Crear un objetivo
router.post('/:projectId/objectives',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  objectiveController.create);

// Crear un constraint
router.post('/:projectId/constraints',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
    constraintController.create);

// Borrar un objetivo
router.delete('/:projectId/objectives/:objectiveId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  // Falta comprobar estados validos
  objectiveController.destroy);

// Borrar un constraint
router.delete('/:projectId/constraints/:constraintId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  // Falta comprobar estados validos
    constraintController.destroy);

// Intercambiar orden de mostrar dos objetivos
router.put('/:projectId/objectives/swaporder/:id1(\\d+)/:id2(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  objectiveController.swapOrder);

// Intercambiar orden de mostrar dos edit
router.put('/:projectId/constraints/swaporder/:id1(\\d+)/:id2(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  constraintController.swapOrder);

// === Consultant

// Mostrar formulario para asignar consultor al proyecto
router.get('/:projectId/consultant/select',
  permissionController.isAuthenticated,
  permissionController.adminRequired,
  projectController.selectConsultant);

// Actualizar el consultor del proyecto
router.post('/:projectId/consultant',
  permissionController.isAuthenticated,
  permissionController.adminRequired,
  projectController.setConsultant);


// === Milestones

// Editar todos los milestones de un proyecto
router.get('/:projectId/milestones/edit',
  permissionController.isAuthenticated,
  milestoneController.editAll);

// Mostrar formulario de creación de un milestone
router.get('/:projectId/milestones/new',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.new);

// Crear milestone
router.post('/:projectId/milestones',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.create);


// Mostrar formulario de edición de un milestone
router.get('/:projectId/milestones/:milestoneId(\\d+)/edit',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.edit);


// Actualizar milestone
router.put('/:projectId/milestones/:milestoneId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.update);


// Eliminar milestone
router.delete('/:projectId/milestones/:milestoneId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.destroy);


// Intercambiar orden de mostrar dos milestones
router.put('/:projectId/milestones/swaporder/:id1(\\d+)/:id2(\\d+)',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.swapOrder);



// Pagina para que el consultor suba un milestone para que lo revise el cliente
router.get('/:projectId/milestones/:milestoneId(\\d+)/submitMilestone',
    permissionController.isAuthenticated,
    permissionController.projectConsultantRequired,
    milestoneController.submitMilestoneForm);

// Action del formulario usado por el consultor para subir un milestone para que lo revise el cliente
router.put('/:projectId/milestones/:milestoneId(\\d+)/submitMilestone',
    permissionController.isAuthenticated,
    permissionController.projectConsultantRequired,
    milestoneController.submitMilestoneAction);


// Sube un milestone para que lo revise el cliente
router.put('/:projectId/milestones/:milestoneId(\\d+)/submitForReview',
    permissionController.isAuthenticated,
    permissionController.projectConsultantRequired,
    milestoneController.submitMilestoneForReview);


// === Milestone Developer

// Asignar Team a los milestones
router.put('/:projectId/milestones/:milestoneId/completeMilestone',
    permissionController.isAuthenticated,
    permissionController.projectConsultantRequired,
    milestoneController.completeMilestone);

// Asignar Team a los milestones
router.put('/:projectId/assign_team',
    permissionController.isAuthenticated,
    permissionController.projectConsultantRequired,
    projectController.assignTeam);

// Mostrar formulario para asignar developer a un milestone
router.get('/:projectId/milestones/:milestoneId(\\d+)/developer/select',
  permissionController.isAuthenticated,
  permissionController.adminRequired,
  milestoneController.selectDeveloper);

// Actualizar el developer de un milesrtone
router.post('/:projectId/milestones/:milestoneId(\\d+)/developer',
  permissionController.isAuthenticated,
  permissionController.adminRequired,
  milestoneController.assignDeveloper);

// Muestra la pagina para que el developer acepte o rechace un milestone.
router.get('/:projectId/milestones/:milestoneId(\\d+)/acceptOrRejectAssignation',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({milestoneDeveloper: true}),
    milestoneController.developerAcceptOrRejectAssignedMilestonePage);


// El developer acepta o rechaza el milestone.
router.put('/:projectId/milestones/:milestoneId(\\d+)/acceptOrRejectAssignation',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({milestoneDeveloper: true}),
    milestoneController.developerAcceptOrRejectAssignedMilestoneUpdate);


// === Client

router.get('/:projectId/escrow',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  escrowController.escrow);


router.get('/:projectId/start',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  escrowController.startProject);

// Muestra la pagina para que el cliente acepte o rechace un milestone submission.
router.get('/:projectId/milestones/:milestoneId(\\d+)/acceptOrRejectSubmission',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({projectClient: true}),
    milestoneController.clientAcceptOrRejectSubmittedMilestonePage);


// El cliente acepta o rechaza el milestone submission.
router.put('/:projectId/milestones/:milestoneId(\\d+)/acceptOrRejectSubmission',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({projectClient: true}),
    milestoneController.clientAcceptOrRejectSubmittedMilestoneUpdate);


// === Disputa

// Muestra la pagina con la historia del milestone para que el cliente y el consultor se envien mensajes
// y resuelvan los conflictos.
router.get('/:projectId/milestones/:milestoneId(\\d+)/history',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({client: true, projectConsultant: true}),
    milestoneController.historyPage);

// El cliente hace un roolback del rechazo del milestone submission.
router.put('/:projectId/milestones/:milestoneId(\\d+)/rollbackSubmission',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({projectClient: true}),
    milestoneController.clientRollbackRejectedSubmission);

// El cliente añade un comentario a la historia del milestone
router.post('/:projectId/milestones/:milestoneId(\\d+)/history/clientComments',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({projectClient: true}),
    milestoneController.createClientHistoryComments);


// El consultor añade un comentario a la historia del milestone
router.post('/:projectId/milestones/:milestoneId(\\d+)/history/consultantComments',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({projectConsultant: true}),
    milestoneController.createConsultantHistoryComments);

// === Pagar

router.post('/:projectId/milestones/:milestoneId(\\d+)/pay',
    permissionController.isAuthenticated,
    permissionController.adminRequired,
    milestoneController.daoPay);

module.exports = router;

const express = require('express');
const router = express.Router();

const projectController = require('../controllers/project');
const objectiveController = require('../controllers/objective');
const constraintController = require('../controllers/constraint');
const milestoneController = require('../controllers/milestone');
const escrowController = require('../controllers/escrow');

const permissionController = require('../controllers/permission');


// Listar todos los proyectos, los de un cliente, o los de un developer
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
router.get('/:projectId(\\d+)',
  permissionController.isAuthenticated,
    projectController.show);

// Mostrar la pantalla que ofrece publicar  (submit) una propuesta nueva o rechazada
router.get('/:projectId(\\d+)/submit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  projectController.submit);

// Mostrar formulario de edición de una propuesta
router.get('/:projectId(\\d+)/edit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  projectController.editProposal);

// Actualizar propuesta
router.put('/:projectId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  projectController.updateProposal);

// Eliminar proyecto
router.delete('/:projectId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({admin: true}),
    projectController.destroy);

// Publicar la propuesta: estado = ProposalPending
router.put('/:projectId(\\d+)/proposal_submit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  projectController.proposalSubmit);

// Rechazar el proyecto: estado = ProposalAccepted
router.put('/:projectId(\\d+)/proposal_reject',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({projectConsultant: true}),
  projectController.rejectProposal);

// Aprobar el proyecto: estado = ProposalAccepted
router.put('/:projectId(\\d+)/proposal_approve',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({projectConsultant: true}),
  projectController.approveProposal);

// Publicar el scope: estado = ScopeValidationNeeded
router.put('/:projectId(\\d+)/scopeSubmit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({projectConsultant: true}),
  projectController.scopeSubmit);

// Aprobar el scope del proyecto: estado =
router.put('/:projectId(\\d+)/scopeAccept',
  permissionController.isAuthenticated,
  permissionController.projectClientRequired,
  // Falta comprobar estado
  projectController.scopeAccept);

// Rechazar el scope del proyecto: estado = ScopingInProgress
router.put('/:projectId(\\d+)/scopeReject',
  permissionController.isAuthenticated,
  permissionController.projectClientRequired,
  // Falta comprobar estado
  projectController.scopeReject);

// === Objetivos y Constraints

// Mostrar formulario para editar Objetivos y Coonstraints
router.get('/:projectId(\\d+)/objectives_constraints/edit',
  permissionController.isAuthenticated,
  projectController.editObjectivesConstraints);


// Crear un objetivo
router.post('/:projectId(\\d+)/objectives',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  objectiveController.create);

// Crear un constraint
router.post('/:projectId(\\d+)/constraints',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
    constraintController.create);

// Borrar un objetivo
router.delete('/:projectId(\\d+)/objectives/:objectiveId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  // Falta comprobar estados validos
  objectiveController.destroy);

// Borrar un constraint
router.delete('/:projectId(\\d+)/constraints/:constraintId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  // Falta comprobar estados validos
    constraintController.destroy);

// Intercambiar orden de mostrar dos objetivos
router.put('/:projectId(\\d+)/objectives/swaporder/:id1(\\d+)/:id2(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  objectiveController.swapOrder);

// Intercambiar orden de mostrar dos edit
router.put('/:projectId(\\d+)/constraints/swaporder/:id1(\\d+)/:id2(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, projectConsultant: true}),
  constraintController.swapOrder);

// === Consultant

// Mostrar formulario para asignar consultor al proyecto
router.get('/:projectId(\\d+)/consultant/select',
  permissionController.isAuthenticated,
  permissionController.adminRequired,
  projectController.selectConsultant);

// Actualizar el consultor del proyecto
router.post('/:projectId(\\d+)/consultant',
  permissionController.isAuthenticated,
  permissionController.adminRequired,
  projectController.setConsultant);


// === Milestones

// Editar todos los milestones de un proyecto
router.get('/:projectId(\\d+)/milestones/edit',
  permissionController.isAuthenticated,
  milestoneController.editAll);

// Mostrar formulario de creación de un milestone
router.get('/:projectId(\\d+)/milestones/new',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.new);

// Crear milestone
router.post('/:projectId(\\d+)/milestones',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.create);


// Mostrar formulario de edición de un milestone
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/edit',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.edit);


// Actualizar milestone
router.put('/:projectId(\\d+)/milestones/:milestoneId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.update);


// Eliminar milestone
router.delete('/:projectId(\\d+)/milestones/:milestoneId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.destroy);


// Intercambiar orden de mostrar dos milestones
router.put('/:projectId(\\d+)/milestones/swaporder/:id1(\\d+)/:id2(\\d+)',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  milestoneController.swapOrder);


// Pagina para que el consultor suba un milestone para que lo revise el cliente
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/submitMilestone',
    permissionController.isAuthenticated,
    permissionController.projectConsultantRequired,
    milestoneController.submitMilestoneForm);

// Action del formulario usado por el consultor para subir un milestone para que lo revise el cliente
router.put('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/submitMilestone',
    permissionController.isAuthenticated,
    permissionController.projectConsultantRequired,
    milestoneController.submitMilestoneAction);



// === Milestone Developer

// Mostrar formulario para asignar developer a un milestone
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/developer/select',
  permissionController.isAuthenticated,
  permissionController.adminRequired,
  milestoneController.selectDeveloper);

// Actualizar el developer de un milesrtone
router.post('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/developer',
  permissionController.isAuthenticated,
  permissionController.adminRequired,
  milestoneController.setDeveloper);

// Muestra la pagina para que el developer acepte o rechace un milestone.
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/acceptOrReject',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({milestoneDeveloper: true}),
    milestoneController.acceptOrRejectMilestonePage);


// El developer acepta o rechaza el milestone.
router.put('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/acceptOrReject',
    permissionController.isAuthenticated,
    permissionController.userTypesRequired({milestoneDeveloper: true}),
    milestoneController.acceptOrRejectMilestoneUpdate);


// === Escrow

router.get('/:projectId(\\d+)/escrow',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  escrowController.escrow);


router.get('/:projectId(\\d+)/start',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  escrowController.startProject);



module.exports = router;

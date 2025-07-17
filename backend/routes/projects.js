const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const projectController = require('../controllers/project');
const objectiveController = require('../controllers/objective');
const constraintController = require('../controllers/constraint');
const milestoneController = require('../controllers/milestone');
const taskController = require('../controllers/task');

const permissionController = require('../controllers/permission');


/* Autoloading */
router.param('projectId', projectController.load);
router.param('objectiveId', objectiveController.load);
router.param('constraintId', constraintController.load);
router.param('milestoneId', milestoneController.load);
router.param('taskId', taskController.load);


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

// Mostrar formulario de edición de una propuesta
router.get('/:projectId(\\d+)/edit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, consultant: true}),
  projectController.editProposal);

// Actualizar propuesta
router.put('/:projectId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true, consultant: true}),
  projectController.updateProposal);

// Eliminar proyecto
router.delete('/:projectId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({admin: true}),
    projectController.destroy);

// Publicar el proyecto: estado = pending
router.put('/:projectId(\\d+)/projectSubmit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({client: true}),
  projectController.projectSubmit);

// Rechazar el proyecto: estado = rejected
router.put('/:projectId(\\d+)/reject',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({admin: true}),
  projectController.reject);

// Aprobar el proyecto: estado = rejected
router.put('/:projectId(\\d+)/approve',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({admin: true}),
  projectController.approve);

// Publicar el scope: estado = validationNeeded
router.put('/:projectId(\\d+)/scopeSubmit',
  permissionController.isAuthenticated,
  permissionController.userTypesRequired({consultant: true}),
  projectController.scopeSubmit);

// Aprobar el scope del proyecto: estado = taskingInProgress
router.put('/:projectId(\\d+)/scopeAccept',
  permissionController.isAuthenticated,
  permissionController.projectClientRequired,
  // Falta comprobar estado
  projectController.scopeAccept);

// Rechazar el scope del proyecto: estado = scopingInProgress
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

// Intercambiar orden de mostrar dos constraints
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

// Listar todos los milestones de un proyecto
router.get('/:projectId(\\d+)/milestones',
  permissionController.isAuthenticated,
  milestoneController.index);

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


// === Tasks

// Editar todos las tasks de todos los milestones del projecto
router.get('/:projectId(\\d+)/tasks/edit',
  permissionController.isAuthenticated,
  taskController.editAll);

// Listar todos las tasks de todos los milestones del projecto
router.get('/:projectId(\\d+)/tasks',
  permissionController.isAuthenticated,
  taskController.showAll);

// Mostrar formulario de creación de una Task
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks/new',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  taskController.new);

// Crear task
router.post('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  taskController.create);


// Mostrar formulario de edición de una task
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks/:taskId(\\d+)/edit',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  taskController.edit);


// Actualizar task
router.put('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks/:taskId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  taskController.update);


// Eliminar task
router.delete('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks/:taskId(\\d+)',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  taskController.destroy);

// Intercambiar orden de mostrar dos tasks
router.put('/:projectId(\\d+)/tasks/swaporder/:id1(\\d+)/:id2(\\d+)',
  permissionController.isAuthenticated,
  permissionController.projectConsultantRequired,
  taskController.swapOrder);

module.exports = router;

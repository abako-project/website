const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const projectController = require('../controllers/project');
const objectiveController = require('../controllers/objective');
const constraintController = require('../controllers/constraint');
const milestoneController = require('../controllers/milestone');
const taskController = require('../controllers/task');


/* Autoloading */
router.param('projectId', projectController.load);
router.param('objectiveId', objectiveController.load);
router.param('constraintId', constraintController.load);
router.param('milestoneId', milestoneController.load);
router.param('taskId', taskController.load);


// Listar todos los proyectos, los de un cliente, o los de un developer
router.get('/',
    authController.isAuthenticated,
    projectController.index);

// Mostrar formulario de creación
router.get('/new',
    authController.isAuthenticated,
    projectController.new);

// Crear proyecto
router.post('/',
    authController.isAuthenticated,
    projectController.create);

// Mostrar detalles de un proyecto
router.get('/:projectId(\\d+)',
    authController.isAuthenticated,
    projectController.show);

// Mostrar formulario de edición
router.get('/:projectId(\\d+)/edit',
    authController.isAuthenticated,
    projectController.editBasic);

// Actualizar proyecto
router.put('/:projectId(\\d+)',
    authController.isAuthenticated,
    projectController.updateBasic);

// Eliminar proyecto
router.delete('/:projectId(\\d+)',
    authController.isAuthenticated,
    projectController.destroy);

// Publicar el proyecto: estado = pending
router.put('/:projectId(\\d+)/projectSubmit',
  authController.isAuthenticated,
  projectController.projectSubmit);

// Rechazar el proyecto: estado = rejected
router.put('/:projectId(\\d+)/reject',
  authController.isAuthenticated,
  projectController.reject);

// Aprobar el proyecto: estado = rejected
router.put('/:projectId(\\d+)/approve',
  authController.isAuthenticated,
  projectController.approve);

// Publicar el scope: estado = validationNeeded
router.put('/:projectId(\\d+)/scopeSubmit',
  authController.isAuthenticated,
  projectController.scopeSubmit);

// Aprobar el scope del proyecto: estado = taskingInProgress
router.put('/:projectId(\\d+)/scopeAccept',
  authController.isAuthenticated,
  projectController.LoggedClientRequired,
  // Falta comprobar estado
  projectController.scopeAccept);

// Rechazar el scope del proyecto: estado = scopingInProgress
router.put('/:projectId(\\d+)/scopeReject',
  authController.isAuthenticated,
  projectController.LoggedClientRequired,
  // Falta comprobar estado
  projectController.scopeReject);

// === Objetivos y Constraints

// Mostrar formulario para editar Objetivos y Coonstraints
router.get('/:projectId(\\d+)/objectives_constraints/edit',
  authController.isAuthenticated,
  projectController.editObjectivesConstraints);


// Crear un objetivo
router.post('/:projectId(\\d+)/objectives',
  authController.isAuthenticated,
  projectController.LoggedClientOrConsultantRequired,
  objectiveController.create);

// Crear un constraint
router.post('/:projectId(\\d+)/constraints',
    authController.isAuthenticated,
    projectController.LoggedClientOrConsultantRequired,
    constraintController.create);

// Borrar un objetivo
router.delete('/:projectId(\\d+)/objectives/:objectiveId(\\d+)',
  authController.isAuthenticated,
  projectController.LoggedClientOrConsultantRequired,
  // Falta comprobar estados validos
  objectiveController.destroy);

// Borrar un constraint
router.delete('/:projectId(\\d+)/constraints/:constraintId(\\d+)',
    authController.isAuthenticated,
    projectController.LoggedClientOrConsultantRequired,
  // Falta comprobar estados validos
    constraintController.destroy);

// === Consultant

// Mostrar formulario para asignar consultor al proyecto
router.get('/:projectId(\\d+)/consultant/select',
  authController.isAuthenticated,
  authController.adminRequired,
  projectController.selectConsultant);

// Actualizar el consultor del proyecto
router.post('/:projectId(\\d+)/consultant',
  authController.isAuthenticated,
  authController.adminRequired,
  projectController.setConsultant);


// === Milestones

// Listar todos los milestones de un proyecto
router.get('/:projectId(\\d+)/milestones',
  authController.isAuthenticated,
  milestoneController.index);

// Mostrar formulario de creación de un milestone
router.get('/:projectId(\\d+)/milestones/new',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  milestoneController.new);

// Crear milestone
router.post('/:projectId(\\d+)/milestones',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  milestoneController.create);


// Mostrar formulario de edición de un milestone
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/edit',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  milestoneController.edit);


// Actualizar milestone
router.put('/:projectId(\\d+)/milestones/:milestoneId(\\d+)',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  milestoneController.update);


// Eliminar milestone
router.delete('/:projectId(\\d+)/milestones/:milestoneId(\\d+)',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  milestoneController.destroy);


// Intercambiar orden de mostrar dos milestones
router.put('/:projectId(\\d+)/milestones/swaporder/:id1(\\d+)/:id2(\\d+)',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  milestoneController.swapOrder);


// === Tasks

// Listar todos las tasks de un milestone
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks',
  authController.isAuthenticated,
  taskController.index);

// Mostrar formulario de creación de una Task
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks/new',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  taskController.new);

// Crear task
router.post('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  taskController.create);


// Mostrar formulario de edición de una task
router.get('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks/:taskId(\\d+)/edit',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  taskController.edit);


// Actualizar task
router.put('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks/:taskId(\\d+)',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  taskController.update);


// Eliminar task
router.delete('/:projectId(\\d+)/milestones/:milestoneId(\\d+)/tasks/:taskId(\\d+)',
  authController.isAuthenticated,
  projectController.LoggedConsultantRequired,
  taskController.destroy);


module.exports = router;

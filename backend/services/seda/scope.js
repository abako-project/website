
const {Sequelize, Op} = require("sequelize");

const json = require("./json");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    Objective, Constraint, Milestone, Task, Role, Comment, Assignation
  }
} = require('../../models');

const states = require("../../controllers/state");


//-----------------------------------------------------------

// Publicar el scope del proyecto.
// Cambia el estado a ValidationNeeded.
// Parametros:
//   * projectId:  id del proyecto
//   * consultantComment: comentario del consultor.
// Devuelve: nada
exports.scopeSubmit = async (projectId, consultantComment) => {

  await Project.update({
    state: states.ProjectState.ValidationNeeded
  }, {where: {id: projectId}});

  await Comment.create({projectId, consultantComment});

};

//-----------------------------------------------------------

// El cliente acepta el scope del proyecto.
// Cambia el estado a TasksPending.
// Parametros:
//   * projectId:  id del proyecto
//   * clientResponse: respuesta del cliente al comentario.
// Devuelve: nada
exports.scopeAccept = async (projectId, clientResponse) => {

  await Project.update({
    state: states.ProjectState.TasksPending
  }, {where: {id: projectId}});


  const [comment] = await Comment.findAll({
    where: {projectId},
    order: [['createdAt', 'DESC']]
  });

  await comment.update({clientResponse});
};

//-----------------------------------------------------------

// Eñl cliente rechaza el scope del proyecto.
// Cambia el estado a ScopingInProgress.
// Parametros:
//   * projectId:  id del proyecto
//   * clientResponse: respuesta del cliente al comentario.
// Devuelve: nada
exports.scopeReject = async (projectId, clientResponse) => {

  await Project.update({
    state: states.ProjectState.ScopingInProgress
  }, {where: {id: projectId}});

  const [comment] = await Comment.findAll({
    where: {projectId},
    order: [['createdAt', 'DESC']]
  });

  await comment.update({clientResponse});
};

//-----------------------------------------------------------

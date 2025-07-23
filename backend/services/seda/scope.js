
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


/**
 * Publica el scope del proyecto.
 * Cambia el estado del proyecto a `ValidationNeeded`
 * y crea un comentario del consultor.
 *
 * @async
 * @function scopeSubmit
 * @param {number} projectId - ID del proyecto.
 * @param {string} consultantComment - Comentario del consultor.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del proyecto o la creación del comentario.
 */
exports.scopeSubmit = async (projectId, consultantComment) => {

  await Project.update({
    state: states.ProjectState.ValidationNeeded
  }, {where: {id: projectId}});

  await Comment.create({projectId, consultantComment});

};

//-----------------------------------------------------------


/**
 * Acepta el scope del proyecto por parte del cliente.
 * Cambia el estado del proyecto a `TasksPending` y actualiza
 * el último comentario con la respuesta del cliente.
 *
 * @async
 * @function scopeAccept
 * @param {number} projectId - ID del proyecto.
 * @param {string} clientResponse - Respuesta del cliente al comentario.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del proyecto o del comentario.
 */
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

/**
 * Rechaza el scope del proyecto por parte del cliente.
 * Cambia el estado del proyecto a `ScopingInProgress` y actualiza
 * el último comentario con la respuesta del cliente.
 *
 * @async
 * @function scopeReject
 * @param {number} projectId - ID del proyecto.
 * @param {string} clientResponse - Respuesta del cliente al comentario.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del proyecto o del comentario.
 */
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

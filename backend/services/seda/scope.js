

const json = require("./json");

const {
  models: {
    Project, Comment
  }
} = require('../../models');

const states = require("../../core/state");


//-----------------------------------------------------------


/**
 * Publica el scope del proyecto.
 * Cambia el estado del proyecto a `ScopeValidationNeeded`
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
    state: states.ProjectState.ScopeValidationNeeded
  }, {where: {id: projectId}});

  await Comment.create({projectId, consultantComment});

};

//-----------------------------------------------------------


/**
 * Acepta el scope del proyecto por parte del cliente.
 * Cambia el estado del proyecto a `EscrowFundingNeeded` y actualiza
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
    state: states.ProjectState.EscrowFundingNeeded
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

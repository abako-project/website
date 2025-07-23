const {Sequelize, Op} = require("sequelize");

const json = require("./json");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    Objective, Constraint, Milestone, Task, Role, Comment, Assignation
  }
} = require('../../models');


//-----------------------------------------------------------

/**
 * Crea un nuevo proyecto a partir de la propuesta inicial de un cliente.
 * Solo se guardan los datos básicos de la propuesta, sin objetivos ni restricciones.
 *
 * @async
 * @function proposalCreate
 * @param {number} clientId - ID del cliente que crea la propuesta.
 * @param {Object} data - Datos de la propuesta.
 * @param {string} data.title - Título del proyecto.
 * @param {string} data.summary - Resumen del proyecto.
 * @param {string} data.description - Descripción detallada.
 * @param {string} data.url - URL de referencia.
 * @param {number} data.budget - Presupuesto estimado.
 * @param {string} data.currency - Moneda del presupuesto.
 * @param {string} data.deliveryDate - Fecha estimada de entrega.
 * @returns {Promise<Object>} Objeto JSON con los datos del proyecto creado.
 */
exports.proposalCreate = async (clientId, {title, summary, description, url, budget, currency, deliveryDate}) => {

  const project = await Project.create({
    title, summary, description, state: null, url, budget, currency, deliveryDate, clientId, consultantId: undefined
  });

  return json.projectJson(project);
};

//-----------------------------------------------------------

/**
 * Actualiza los datos básicos de la propuesta de un proyecto existente.
 * No modifica objetivos ni restricciones.
 *
 * @async
 * @function proposalUpdate
 * @param {number} projectId - ID del proyecto a actualizar.
 * @param {Object} data - Nuevos valores de la propuesta.
 * @param {string} data.title
 * @param {string} data.summary
 * @param {string} data.description
 * @param {string} data.url
 * @param {number} data.budget
 * @param {string} data.currency
 * @param {string} data.deliveryDate
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados del proyecto.
 */
exports.proposalUpdate = async (projectId, {title, summary, description, url, budget, currency, deliveryDate}) => {

  await Project.update({
    title, summary, description, url, budget, currency, deliveryDate
  }, {
    where: {id: projectId}
  });

  const project = await Project.findByPk(projectId);

  return json.projectJson(project);
};


//-----------------------------------------------------------


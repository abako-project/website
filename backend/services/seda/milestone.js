
const json = require("./json");

const {
  models: {Project,  Milestone, Task}
} = require('../../models');

const sequelize = require("../../models");

//-----------------------------------------------------------

/**
 * Devuelve todos los datos de un milestone por su ID,
 * incluyendo el proyecto y sus tareas asociadas.
 *
 * @async
 * @function milestone
 * @param {number} milestoneId - ID del milestone.
 * @returns {Promise<Object>} Objeto JSON con los datos del milestone.
 * @throws {Error} Si no se encuentra el milestone.
 */
exports.milestone = async milestoneId => {

  const milestone = await Milestone.findByPk(milestoneId, {
    include: [
      {model: Project, as: 'project'},
      {model: Task, as: 'tasks'}
    ],
  });

  if (milestone) {
    return json.milestoneJson(milestone);
  } else {
    throw new Error('There is no milestone with id=' + milestoneId);
  }
};

//-----------------------------------------------------------

/**
 * Crea un nuevo milestone asociado a un proyecto.
 *
 * @async
 * @function milestoneCreate
 * @param {number} projectId - ID del proyecto al que pertenece el milestone.
 * @param {Object} data - Datos del milestone.
 * @param {string} data.title - Título del milestone.
 * @param {string} data.description - Descripción del milestone.
 * @param {number} data.budget - Presupuesto asignado.
 * @param {string} data.currency - Moneda del presupuesto.
 * @param {string} data.deliveryDate - Fecha estimada de entrega.
 * @returns {Promise<Object>} Objeto JSON del milestone creado.
 */
exports.milestoneCreate = async (projectId, {title, description, budget, currency, deliveryDate}) => {

  const milestone = await Milestone.create({
    title, description, budget, currency, deliveryDate, projectId
  });

  return json.milestoneJson(milestone);
};

//-----------------------------------------------------------

/**
 * Actualiza los datos de un milestone existente.
 *
 * @async
 * @function milestoneUpdate
 * @param {number} milestoneId - ID del milestone a actualizar.
 * @param {Object} data - Nuevos valores.
 * @param {string} data.title
 * @param {string} data.description
 * @param {number} data.budget
 * @param {string} data.currency
 * @param {string} data.deliveryDate
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados.
 */
exports.milestoneUpdate = async (milestoneId, {title, description, budget, currency, deliveryDate}) => {

  let milestone = await Milestone.findByPk(milestoneId);

  milestone = await milestone.update({
    title, description, budget, currency, deliveryDate
  });

  return json.milestoneJson(milestone);
};

//-----------------------------------------------------------

/**
 * Intercambia el orden de visualización de dos milestones.
 *
 * @async
 * @function milestoneSwapOrder
 * @param {number} milestoneId1 - ID del primer milestone.
 * @param {number} milestoneId2 - ID del segundo milestone.
 * @returns {Promise<void>}
 * @throws {Error} Si alguno de los milestones no existe o falla la transacción.
 */
exports.milestoneSwapOrder = async (milestoneId1, milestoneId2) => {

  const transaction = await sequelize.transaction();
  try {
    const milestone1 = await Milestone.findByPk(milestoneId1, {transaction});
    if (!milestone1) {
      throw new Error('Milestone 1 not found.');
    }

    const milestone2 = await Milestone.findByPk(milestoneId2, {transaction});
    if (!milestone2) {
      throw new Error('Milestone 2 not found.');
    }

    const displayOrder1 = milestone1.displayOrder;
    const displayOrder2 = milestone2.displayOrder;

    // Intercambiamos posiciones
    await milestone1.update({displayOrder: displayOrder2}, {transaction}),
      await milestone2.update({displayOrder: displayOrder1}, {transaction})

    await transaction.commit();

  } catch(error) {
    await transaction.rollback();
    throw error;
  }
};

//-----------------------------------------------------------

/**
 * Elimina un milestone por su ID.
 *
 * @async
 * @function milestoneDestroy
 * @param {number} milestoneId - ID del milestone a eliminar.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la eliminación.
 */
exports.milestoneDestroy = async milestoneId => {
  await Milestone.destroy({where: {id: milestoneId}});
};

//-----------------------------------------------------------

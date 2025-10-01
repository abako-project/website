const json = require("./json");

const {
  models: {
    Objective
  }
} = require('../../models');
const sequelize = require("../../models");


//-----------------------------------------------------------

/**
 * Devuelve los datos de un objetivo por su ID.
 *
 * @async
 * @function objective
 * @param {number} objectiveId - ID del objetivo.
 * @returns {Promise<Object>} Objeto JSON con los datos del objetivo.
 * @throws {Error} Si no se encuentra el objetivo.
 */
exports.objective = async objectiveId => {

  const objective = await Objective.findByPk(objectiveId);
  if (objective) {
    return json.objectiveJson(objective);
  } else {
    throw new Error('There is no objective with id=' + objectiveId);
  }
};

//-----------------------------------------------------------

/**
 * Crea un nuevo objetivo asociado a un proyecto.
 *
 * @async
 * @function objectiveCreate
 * @param {number} projectId - ID del proyecto al que pertenece el objetivo.
 * @param {string} description - Descripción del objetivo.
 * @returns {Promise<Object>} Objeto JSON con los datos del objetivo creado.
 */
exports.objectiveCreate = async (projectId, description) => {

  const objective = await Objective.create({projectId, description});

  return json.objectiveJson(objective);
};

//-----------------------------------------------------------

/**
 * Intercambia el orden de visualización de dos objetivos.
 *
 * @async
 * @function objectivesSwapOrder
 * @param {number} objectiveId1 - ID del primer objetivo.
 * @param {number} objectiveId2 - ID del segundo objetivo.
 * @returns {Promise<void>}
 * @throws {Error} Si alguno de los objetivos no existe o falla la transacción.
 */
exports.objectivesSwapOrder = async (objectiveId1, objectiveId2) => {

  const transaction = await sequelize.transaction();
  try {
    const objective1 = await Objective.findByPk(objectiveId1, {transaction});
    if (!objective1) {
      throw new Error('Objective 1 not found.');
    }

    const objective2 = await Objective.findByPk(objectiveId2, {transaction});
    if (!objective2) {
      throw new Error('Objective 2 not found.');
    }

    const displayOrder1 = objective1.displayOrder;
    const displayOrder2 = objective2.displayOrder;

    // Intercambiamos posiciones
    await objective1.update({displayOrder: displayOrder2}, {transaction}),
      await objective2.update({displayOrder: displayOrder1}, {transaction})

    await transaction.commit();

  } catch(error) {
    await transaction.rollback();
    throw error;
  }
}


//-----------------------------------------------------------

/**
 * Elimina un objetivo por su ID.
 *
 * @async
 * @function objectiveDestroy
 * @param {number} objectiveId - ID del objetivo a eliminar.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error durante la eliminación.
 */
exports.objectiveDestroy = async objectiveId => {
  await Objective.destroy({where: {id: objectiveId}});
};

//-----------------------------------------------------------

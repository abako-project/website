
const json = require("./json");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    Objective, Constraint, Milestone, Task, Role, Comment, Assignation
  }
} = require('../../models');
const sequelize = require("../../models");


//-----------------------------------------------------------

/**
 * Devuelve los datos de un constraint por su ID.
 *
 * @async
 * @function constraint
 * @param {number} constraintId - ID del constraint.
 * @returns {Promise<Object>} Objeto JSON con los datos del constraint.
 * @throws {Error} Si no se encuentra el constraint.
 */
exports.constraint = async constraintId => {

  const constraint = await Constraint.findByPk(constraintId);
  if (constraint) {
    return json.constraintJson(constraint);
  } else {
    throw new Error('There is no constraint with id=' + constraintId);
  }
};

//-----------------------------------------------------------

/**
 * Crea un nuevo constraint asociado a un proyecto.
 *
 * @async
 * @function constraintCreate
 * @param {number} projectId - ID del proyecto al que pertenece el constraint.
 * @param {string} description - Descripción del constraint.
 * @returns {Promise<Object>} Objeto JSON con el constraint creado.
 */
exports.constraintCreate = async (projectId, description) => {

  const constraint = await Constraint.create({projectId, description});

  return json.constraintJson(constraint);
};

//-----------------------------------------------------------

/**
 * Intercambia el orden de visualización de dos constraints.
 *
 * @async
 * @function constraintsSwapOrder
 * @param {number} constraintId1 - ID del primer constraint.
 * @param {number} constraintId2 - ID del segundo constraint.
 * @returns {Promise<void>}
 * @throws {Error} Si alguno de los constraints no existe o falla la transacción.
 */
exports.constraintsSwapOrder = async (constraintId1, constraintId2) => {

  const transaction = await sequelize.transaction();
  try {
    const constraint1 = await Constraint.findByPk(constraintId1, {transaction});
    if (!constraint1) {
      throw new Error('Constraint 1 not found.');
    }

    const constraint2 = await Constraint.findByPk(constraintId2, {transaction});
    if (!constraint2) {
      throw new Error('constraint 2 not found.');
    }

    const displayOrder1 = constraint1.displayOrder;
    const displayOrder2 = constraint2.displayOrder;

    // Intercambiamos posiciones
    await constraint1.update({displayOrder: displayOrder2}, {transaction}),
      await constraint2.update({displayOrder: displayOrder1}, {transaction})

    await transaction.commit();

  } catch(error) {
    await transaction.rollback();
    throw error;
  }
}

//-----------------------------------------------------------

/**
 * Elimina un constraint por su ID.
 *
 * @async
 * @function constraintDestroy
 * @param {number} constraintId - ID del constraint a eliminar.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la eliminación.
 */
exports.constraintDestroy = async constraintId => {
  await Constraint.destroy({where: {id: constraintId}});
};

//-----------------------------------------------------------

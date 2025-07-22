
const json = require("./json");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    Objective, Constraint, Milestone, Task, Role, Comment, Assignation
  }
} = require('../../models');
const sequelize = require("../../models");


//-----------------------------------------------------------

// Devuelve los datos de un constraint.
// Parametros:
//   * constraintId: id del constraint
// Devuelve: un JSON con los datos del constraint,
exports.constraint = async constraintId => {

  const constraint = await Constraint.findByPk(constraintId);
  if (constraint) {
    return json.constraintJson(constraint);
  } else {
    throw new Error('There is no constraint with id=' + constraintId);
  }
};

//-----------------------------------------------------------

// Crea un constraint nuevo.
// Parametros:
//    projectId: id del projecto al que pertenece el constraint.
//    description: descripcion del constraint.
// Devuelve un JSON con los datos del constraint creado.
exports.constraintCreate = async (projectId, description) => {

  const constraint = await Constraint.create({projectId, description});

  return json.constraintJson(constraint);
};

//-----------------------------------------------------------

// Intercambiar el orden de visualizacion de 2 constraints
// Parametros:
//   * constraintId1: id de uno de los constraint.
//   * constraintId2: id del otro constraint.
// Devuelve: nada
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

// Borra un constraint.
// Parametros:
//   * constraintId:  id del constraint
// Devuelve: nada
exports.constraintDestroy = async constraintId => {
  await Constraint.destroy({where: {id: constraintId}});
};

//-----------------------------------------------------------

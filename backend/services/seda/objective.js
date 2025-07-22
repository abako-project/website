const json = require("./json");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    Objective, Constraint, Milestone, Task, Role, Comment, Assignation
  }
} = require('../../models');
const sequelize = require("../../models");


//-----------------------------------------------------------

// Devuelve los datos de un objetivo.
// Parametros:
//   * objectiveId: id del objetivo
// Devuelve: un JSON con los datos del objetivo,
exports.objective = async objectiveId => {

  const objective = await Objective.findByPk(objectiveId);
  if (objective) {
    return json.objectiveJson(objective);
  } else {
    throw new Error('There is no objective with id=' + objectiveId);
  }
};

//-----------------------------------------------------------

// Crea un objetivo nuevo.
// Parametros:
//    projectId: id del projecto al que pertenece el objetivo.
//    description: descripcion del objetivo.
// Devuelve un JSON con los datos del objetivo creado.
exports.objectiveCreate = async (projectId, description) => {

  const objective = await Objective.create({projectId, description});

  return json.objectiveJson(objective);
};

//-----------------------------------------------------------

// Intercambiar el orden de visualizacion de 2 objectives
// Parametros:
//   * objectiveId1: id de uno de los objetivo.
//   * objectiveId2: id del otro objetivo.
// Devuelve: nada
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

// Borra un objetivo.
// Parametros:
//   * objectiveId:  id del objetivo
// Devuelve: nada
exports.objectiveDestroy = async objectiveId => {
  await Objective.destroy({where: {id: objectiveId}});
};

//-----------------------------------------------------------

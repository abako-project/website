
const json = require("./json");

const {
  models: {Project,  Milestone, Task}
} = require('../../models');

const sequelize = require("../../models");

//-----------------------------------------------------------

// Devuelve todos los datos del milestone.
// Parametros:
//   * milestoneId: id del milestone
// Devuelve: un JSON con todos los datos del milestone
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


// Crea un milestone nuevo.
// Parametros:
//    projectId: id del projecto al que añadir el milestone.
//    otros: datos del milestone
// Devuelve un JSON con los datos del milestone creado.
exports.milestoneCreate = async (projectId, {title, description, budget, currency, deliveryDate}) => {

  const milestone = await Milestone.create({
    title, description, budget, currency, deliveryDate, projectId
  });

  return json.milestoneJson(milestone);
};

//-----------------------------------------------------------

// Actualiza los datos de un milestone.
// Parametros:
//    milestoneId: id del milestone.
//    otros: nuevos valores para actualizar el milestone
// Devuelve un JSON con los datos del milestone actualizado.
exports.milestoneUpdate = async (milestoneId, {title, description, budget, currency, deliveryDate}) => {

  let milestone = await Milestone.findByPk(milestoneId);

  milestone = await milestone.update({
    title, description, budget, currency, deliveryDate
  });

  return json.milestoneJson(milestone);
};

//-----------------------------------------------------------

// Intercambiar el orden de visualizacion de 2 milestones.
// Parametros:
//   * milestoneId1: id de uno de los milestones.
//   * milestoneId2: id del otro milestone.
// Devuelve: nada
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

// Borra un milestone.
// Parametros:
//    milestoneId: id del milestone.
// Devuelve: nada
exports.milestoneDestroy = async milestoneId => {
  await Milestone.destroy({where: {id: milestoneId}});
};

//-----------------------------------------------------------

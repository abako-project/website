const {Sequelize, Op} = require("sequelize");

const json = require("./json");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    Objective, Constraint, Milestone, Task, Role, Comment, Assignation
  }
} = require('../../models');


//-----------------------------------------------------------

// Crea un proyecto nuevo.
// Solo se guardan los datos de la propuesta inicial del cliente.
// No se guardan ni objetivos ni constraints.
// Parametros:
//    clientId: id del cliente que crea la propuesta.
//    otros: datos de la propuesta
// Devuelve un JSON con los datos del proyecto creado.
exports.proposalCreate = async (clientId, {title, summary, description, url, budget, currency, deliveryDate}) => {

  const project = await Project.create({
    title, summary, description, state: null, url, budget, currency, deliveryDate, clientId, consultantId: undefined
  });

  return json.projectJson(project);
};

//-----------------------------------------------------------

// Actualiza los datos de la propuesta del un projecto.
// No se actualizan ni objetivos ni constraints.
// Parametros:
//    projectId: id del proyecto.
//    otros: nuevos valores para actualizar de la propuesta
// Devuelve un JSON con los datos del proyecto actualizado.
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



const json = require("./json");

const {
  models: {Developer, User, Attachment, Project,  Milestone, Task, Role, Assignation}
} = require('../../models');

const sequelize = require("../../models");
const states = require("../../controllers/state");

//-----------------------------------------------------------

// Devuelve todos los datos de la task.
// Parametros:
//   * taskId: id de la task.
// Devuelve: un JSON con todos los datos de la task.
exports.task = async taskId => {

  const task = await Task.findByPk(taskId, {
    include: [
      {
        model: Milestone, as: 'milestone',
        include: [
          {model: Project, as: 'project'}
        ]
      },
      {model: Role, as: 'role'},
      {
        model: Assignation, as: 'assignation',
        include: [{
          model: Developer, as: 'developer',
          include: [
            {model: User, as: "user"},
            {model: Attachment, as: "attachment"}]
        }]
      }
    ]
  });

  if (task) {
    return json.taskJson(task);
  } else {
    throw new Error('There is no task with id=' + taskId);
  }
};

//-----------------------------------------------------------


// Crea una task nueva.
// Parametros:
//    milestoneId: id del milestone al que añadir la task.
//    otros: datos de la task.
// Devuelve un JSON con los datos de la task creada.
exports.taskCreate = async (milestoneId, {title, description, budget, currency, deliveryDate, roleId}) => {

  let task = await Task.create({
    title, description, budget, currency, deliveryDate, milestoneId
  });

  if (roleId) {
    task = await task.setRole(roleId);
  }

  return json.taskJson(task);
};

//-----------------------------------------------------------

// Actualiza los datos de una task.
// Parametros:
//   * taskId: id de la task.
//    otros: nuevos valores para actualizar la task.
// Devuelve un JSON con los datos de la task actualizada.
exports.taskUpdate = async (taskId, {title, description, budget, currency, deliveryDate, roleId}) => {

  let task = await Task.findByPk(taskId);

  task = await task.update({
    title, description, budget, currency, deliveryDate
  });

  if (roleId) {
    task = await task.setRole(roleId);
  } else {
    task = await task.setRole(null);
  }

  return json.taskJson(task);
};

//-----------------------------------------------------------

// Intercambiar el orden de visualizacion de 2 tasks.
// Parametros:
//   * taskId1: id de uno de las tasks.
//   * taskId2: id de la otra task.
// Devuelve: nada
exports.tasksSwapOrder = async (taskId1, taskId2) => {

  const transaction = await sequelize.transaction();
  try {
    const task1 = await Task.findByPk(taskId1, {transaction});
    if (!task1) {
      throw new Error('Task 1 not found.');
    }

    const task2 = await Task.findByPk(taskId2, {transaction});
    if (!task2) {
      throw new Error('Task 2 not found.');
    }

    const displayOrder1 = task1.displayOrder;
    const displayOrder2 = task2.displayOrder;

    // Intercambiamos posiciones
    await task1.update({displayOrder: displayOrder2}, {transaction}),
      await task2.update({displayOrder: displayOrder1}, {transaction})

    await transaction.commit();

  } catch(error) {
    await transaction.rollback();
    throw error;
  }
};

//-----------------------------------------------------------

// Borra una task.
// Parametros:
//   * taskId: id de la task.
// Devuelve: nada
exports.taskDestroy = async taskId => {
  await Task.destroy({where: {id: taskId}});
};

//-----------------------------------------------------------

// Publicar las tareas creadas por el consultor del proyecto.
// Cambia el estado a TeamAssignmentPending.
// Parametros:
//   * projectId:  id del proyecto
// Devuelve: nada
exports.tasksSubmit = async (projectId) => {

  await Project.update({
    state: states.ProjectState.TeamAssignmentPending
  }, {where: {id: projectId}});
};

//-----------------------------------------------------------

// DAO/Admin: Asignar developer a una task.
// Parametros:
//   * taskId: id de la task.
//   * developerId: id del developer
// Devuelve: nada
exports.taskSetDeveloper = async (taskId, developerId) => {

  // Borrar asignacion actual:
  await Assignation.destroy({where: {taskId}});

  if (developerId) {
    // Crear nueva asignacion:
    const newAssignation = await Assignation.create({
      developerId,
      state: "Pending",
      comment: "",
      taskId
    });
  }
};

//-----------------------------------------------------------

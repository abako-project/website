
const json = require("./json");

const {
  models: {Developer, User, Attachment, Project,  Milestone, Task, Role, Assignation}
} = require('../../models');

const sequelize = require("../../models");
const states = require("../../controllers/state");

//-----------------------------------------------------------

/**
 * Devuelve todos los datos de una tarea (task) por su ID,
 * incluyendo el milestone, proyecto, rol y asignación.
 *
 * @async
 * @function task
 * @param {number} taskId - ID de la tarea.
 * @returns {Promise<Object>} Objeto JSON con los datos de la tarea.
 * @throws {Error} Si no se encuentra la tarea.
 */
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

/**
 * Crea una nueva tarea asociada a un milestone.
 *
 * @async
 * @function taskCreate
 * @param {number} milestoneId - ID del milestone al que se asocia la tarea.
 * @param {Object} data - Datos de la tarea.
 * @param {string} data.title
 * @param {string} data.description
 * @param {number} data.budget
 * @param {string} data.currency
 * @param {string} data.deliveryDate
 * @param {number} [data.roleId] - Rol requerido (opcional).
 * @returns {Promise<Object>} Objeto JSON con los datos de la tarea creada.
 */
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

/**
 * Actualiza los datos de una tarea existente.
 *
 * @async
 * @function taskUpdate
 * @param {number} taskId - ID de la tarea.
 * @param {Object} data - Nuevos valores de la tarea.
 * @param {string} data.title
 * @param {string} data.description
 * @param {number} data.budget
 * @param {string} data.currency
 * @param {string} data.deliveryDate
 * @param {number|null} [data.roleId] - ID del nuevo rol o `null` si se elimina.
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados de la tarea.
 */
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

/**
 * Intercambia el orden de visualización de dos tareas.
 *
 * @async
 * @function tasksSwapOrder
 * @param {number} taskId1 - ID de la primera tarea.
 * @param {number} taskId2 - ID de la segunda tarea.
 * @returns {Promise<void>}
 * @throws {Error} Si alguna de las tareas no existe o falla la transacción.
 */
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

/**
 * Elimina una tarea por su ID.
 *
 * @async
 * @function taskDestroy
 * @param {number} taskId - ID de la tarea a eliminar.
 * @returns {Promise<void>}
 */
exports.taskDestroy = async taskId => {
  await Task.destroy({where: {id: taskId}});
};

//-----------------------------------------------------------

/**
 * Publica las tareas creadas por el consultor del proyecto y cambia el estado
 * del proyecto a `TeamAssignmentPending`.
 *
 * @async
 * @function tasksSubmit
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<void>}
 */
exports.tasksSubmit = async (projectId) => {

  await Project.update({
    state: states.ProjectState.TeamAssignmentPending
  }, {where: {id: projectId}});
};

//-----------------------------------------------------------

/**
 * Asigna un desarrollador a una tarea, eliminando cualquier asignación previa.
 * Si `developerId` es null o undefined, solo se elimina la asignación actual.
 *
 * @async
 * @function taskSetDeveloper
 * @param {number} taskId - ID de la tarea.
 * @param {number} [developerId] - ID del desarrollador (opcional).
 * @returns {Promise<void>}
 */
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

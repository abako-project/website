const {Sequelize, Op} = require("sequelize");

const json = require("./json");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    Objective, Constraint, Milestone, Task, Role, Comment, Assignation
  }
} = require('../../models');

const states = require("../../controllers/state");


//-----------------------------------------------------------

// Devuelve todos los datos del proyecto
// Parametros:
//   * projectId: id del proyecto
// Devuelve: un JSON con todos los datos del proyecto
exports.project = async projectId => {

  const project = await Project.findByPk(projectId, {
    include: [
      {
        model: Client, as: 'client',
        include: [
          {model: User, as: "user"},
          {model: Attachment, as: "attachment"}]
      },
      {
        model: Developer, as: 'consultant',
        include: [
          {model: User, as: "user"},
          {model: Attachment, as: "attachment"}]
      },
      {
        model: Objective, as: 'objectives',
        separate: true,
        order: [['displayOrder', 'ASC']]
      },
      {
        model: Constraint, as: 'constraints',
        separate: true,
        order: [['displayOrder', 'ASC']]
      },
      {
        model: Milestone, as: 'milestones',
        separate: true,
        order: [['displayOrder', 'ASC']],
        include: [
          {
            model: Task, as: 'tasks',
            separate: true,
            order: [['displayOrder', 'ASC']],
            include: [
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
          }
        ]
      },
      {
        model: Comment, as: "comments",
        separate: true,
        order: [['createdAt', 'DESC']],
      }
    ]
  });
  if (project) {
    return json.projectJson(project);
  } else {
    throw new Error('There is no project with id=' + projectId);
  }
};

//-----------------------------------------------------------

// Devuelve el Id del cliente de un proyecto.
// Parametros:
//   * projectId: id del proyecto
// Devuelve: el Id del cliente del proyecto.
exports.projectClientId = async projectId => {

  const project = await Project.findByPk(projectId);

  if (project) {
    return project.clientId;
  } else {
    throw new Error('There is no project with id=' + projectId);
  }
};

//-----------------------------------------------------------

// Devuelve el Id del consultor de un proyecto.
// Parametros:
//   * projectId: id del proyecto
// Devuelve: el Id del consultor del proyecto.
exports.projectConsultantId = async projectId => {

  const project = await Project.findByPk(projectId);

  if (project) {
    return project.consultantId;
  } else {
    throw new Error('There is no project with id=' + projectId);
  }
};

//-----------------------------------------------------------

// Devuelve un indice de proyectos.
// Dependiendo delos parametros, se devuelven todos los proyectos o solo algunos de ellos.
// Si no se pasan valores para clientId, consultantId, ni developerId, se devuelven todos los proyectos.
// Si se pasa un  valor para clientId, se devuelven los proyectos de ese cliente.
// Si se pasa un  valor para consultantId, se devuelven tambien los proyectos de ese consultor.
// Si se pasa un  valor para developerId, se devuelven tambien los proyectos de en los que ese desarrollador trabaja como desarrollador.
// Incluye los datos del cliente, consultor y desarrolladores del proyecto.
// Parametros:
//   * clientId:  id del cliente
//   * consultantId:  id del consultor
//   * developerId: id del desarrollador
// Devuelve: un JSON con los datos necesarios para un indice de proyectos
exports.projectsIndex = async (clientId, consultantId, developerId) => {

  let options = {
    include: [
      {
        model: Client, as: 'client',
        include: [
          {model: User, as: "user"},
          {model: Attachment, as: "attachment"}]
      },
      {
        model: Developer, as: 'consultant',
        include: [
          {model: User, as: "user"},
          {model: Attachment, as: "attachment"}]
      },
      {
        model: Milestone, as: 'milestones',
        include: [
          {
            model: Task, as: 'tasks',
            include: [
              {
                model: Assignation, as: 'assignation',
                required: true,
                include: [{
                  model: Developer, as: 'developer'
                }]
              }
            ]
          }
        ]
      }
    ]
  };

  const orItems = [];
  if (clientId) {
    orItems.push({clientId});
  }
  if (consultantId) {
    orItems.push({consultantId});
  }
  if (developerId) {
    orItems.push({'$milestones.tasks.assignation.developer.id$': developerId});
  }
  if (orItems.length > 0) {
    options.where = {
      [Op.or]: orItems
    };
  }

  const projects = await Project.findAll(options);

  return projects.map(project => json.projectJson(project));
};

//-----------------------------------------------------------

// Actualiza el valor del estado de un proyecto.
// Parametros:
//   * projectId:  id del proyecto
//   * state: nuevo estado
// Devuelve: nada
exports.projectSetState = async (projectId, state) => {
  await Project.update({state}, {where: {id: projectId}});
};

//-----------------------------------------------------------

// Publicar la propuesta de un proyecto.
// Cambia el estado a Pending.
// Parametros:
//   * projectId:  id del proyecto
// Devuelve: nada
exports.projectSubmit = async (projectId) => {
  await Project.update({
    state: states.ProjectState.Pending
  }, {where: {id: projectId}});
};


//-----------------------------------------------------------

// DAO/Admin: Aprobar un proyecto.
// Cambia el estado a Approved.
// Parametros:
//   * projectId:  id del proyecto
// Devuelve: nada
exports.projectApprove = async (projectId) => {
  await Project.update({
    state: states.ProjectState.Approved
  }, {where: {id: projectId}});
};


//-----------------------------------------------------------

// DAO/Admin: Rechazar un proyecto.
// Cambia el estado a Rejected.
// Parametros:
//   * projectId:  id del proyecto
// Devuelve: nada
exports.projectReject = async (projectId) => {
  await Project.update({
    state: states.ProjectState.Rejected
  }, {where: {id: projectId}});
};

//-----------------------------------------------------------

// DAO/Admin: Asignar consultor a un proyecto.
// Cambia el estado a ScopingInProgress.
// Parametros:
//   * projectId:    id del proyecto
//   * consultantId: id del consultor
// Devuelve: nada
exports.projectSetConsultant = async (projectId, consultantId) => {

  await Project.update({
    consultantId,
    state: states.ProjectState.ScopingInProgress
  }, {where: {id: projectId}});
};

//-----------------------------------------------------------

// Borra un proyecto.
// Parametros:
//   * projectId:  id del proyecto
// Devuelve: nada
exports.projectDestroy = async projectId => {
  await Project.destroy({where: {id: projectId}});
};

//-----------------------------------------------------------

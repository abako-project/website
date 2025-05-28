const createError = require('http-errors');
const Sequelize = require("sequelize");

const states = require("./state");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    ProjectObjective, ProjectConstraint, Milestone, Task, Role
  }
} = require('../models');
const authController = require("./auth");


// Autoload el project asociado a :projectId
exports.load = async (req, res, next, projectId) => {

  try {
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
        {model: ProjectObjective, as: 'objectives'},
        {model: ProjectConstraint, as: 'constraints'},
        {
          model: Milestone, as: 'milestones',

          separate: true,

          order: [['displayOrder', 'ASC']],
          include: [
            {model: Task, as: 'tasks',
              include: [
                {model: Role, as: 'role'}
              ]
            }
          ]
        }
      ]
    });
    if (project) {
      req.load = {...req.load, project};
      next();
    } else {
      throw createError(404, 'There is no project with id=' + projectId);
    }
  } catch (error) {
    next(error);
  }
};


// MW that allows actions only if the user logged in is the project client.
exports.LoggedClientRequired = (req, res, next) => {

  const clientIsLogged = !!req.session.loginUser?.clientId;
  const clientLoggedIsProjectClient = req.load?.project.clientId === req.session.loginUser?.clientId;

  if (clientIsLogged && clientLoggedIsProjectClient) {
    next();
  } else {
    console.log('Prohibited operation: The logged in user is not the project client.');
    next(new Error('Prohibited operation: The logged in user is not the project client.'));
  }
};

// MW that allows actions only if the user logged in is the project consultant.
exports.LoggedConsultantRequired = (req, res, next) => {

  const developerIsLogged = !!req.session.loginUser?.developerId;
  const developerLoggedIsProjectConsultant = req.load?.project.consultantId === req.session.loginUser?.developerId;


  if (developerIsLogged && developerLoggedIsProjectConsultant) {
    next();
  } else {
    console.log('Prohibited operation: The logged in user is not the project consultant.');
    next(new Error('Prohibited operation: The logged in user is not the project consultant.'));
  }
};


// MW that allows actions only if the user logged in is the project client or the project consultant.
exports.LoggedClientOrConsultantRequired = (req, res, next) => {

  const clientIsLogged = !!req.session.loginUser?.clientId;
  const clientLoggedIsProjectClient = req.load?.project.clientId === req.session.loginUser?.clientId;

  const developerIsLogged = !!req.session.loginUser?.developerId;
  const developerLoggedIsProjectConsultant = req.load?.project.consultantId === req.session.loginUser?.developerId;

  if ((clientIsLogged && clientLoggedIsProjectClient) ||
(developerIsLogged && developerLoggedIsProjectConsultant)) {
    next();
  } else {
    console.log('Prohibited operation: The logged in user is not the project client nor consultant.');
    next(new Error('Prohibited operation: The logged in user is not the project client nor consultant.'));
  }
};

// Listar todos los proyectos o los de un cliente o los de un developer
exports.index = async (req, res, next) => {

  try {
    const client = req.load?.client;
    const developer = req.load?.developer;

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
        }
      ]
    };

    if (client) {
      options.where = {clientId: client.id};
    }

    if (developer) {
      options.where = {consultantId: developer.id};
    }

    const projects = await Project.findAll(options);

    res.render('projects/index', {projects, client, developer});
  } catch (error) {
    next(error);
  }
};


// Mostrar formulario de creación
exports.new = (req, res, next) => {

  const project = {
    title: "",
    summary: "",
    description: "",
    url: "",
    budget: "",
    currency: "",
    deliveryDate: Date.now() + 60 * 60 * 1000
  };

  // Timezone offset del cliente
  let {clienttimezoneoffset} = req.query;
  clienttimezoneoffset = Number(clienttimezoneoffset);
  clienttimezoneoffset = Number.isNaN(clienttimezoneoffset) ? 0 : clienttimezoneoffset;
  const clientTimezoneOffset = clienttimezoneoffset * 60 * 1000;

  res.render('projects/newBasic', {
    project,
    clientTimezoneOffset,
  });
};

// Crear proyecto
exports.create = async (req, res, next) => {

  let {title, summary, description, url, budget, currency, deliveryDate} = req.body;

  let {clientTimezoneOffset} = req.body;
  clientTimezoneOffset = Number(clientTimezoneOffset);
  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  deliveryDate = new Date(deliveryDate).valueOf() + clientTimezoneOffset - serverTimezoneOffset;

  const clientId = req.session.loginUser?.clientId;
  // const consultantId = (await Developer.findOne())?.id; // El primer developer es el consultor.
  const consultantId = undefined

  let project = Project.build({
    title,
    summary,
    description,
    state: null,  // states.ProjectState.Creating,
    url,
    budget,
    currency,
    deliveryDate,
    clientId,
    consultantId
  });

  try {
    // Save into the data base
    project = await project.save();
    console.log('Success: Project created successfully.');

    // res.redirect('/clients/' + req.session.loginUser.clientId + '/projects');
    res.redirect('/projects/' + project.id + '/objectives_constraints/edit');

  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('projects/basics/new', {
        project,
        clientTimezoneOffset,
      });
    } else {
      next(error);
    }
  }

};

// Mostrar detalle de un proyecto
exports.showAll = async (req, res, next) => {

  const {project} = req.load;

  // Timezone offset del cliente
  let {clienttimezoneoffset} = req.query;
  clienttimezoneoffset = Number(clienttimezoneoffset);
  clienttimezoneoffset = Number.isNaN(clienttimezoneoffset) ? 0 : clienttimezoneoffset;
  const clientTimezoneOffset = clienttimezoneoffset * 60 * 1000;

  res.render('projects/showAll', {
    project,
    clientTimezoneOffset,
  });
};


// Mostrar formulario de edición
exports.editBasic = async (req, res, next) => {

  const {project} = req.load;

  // Timezone offset del cliente
  let {clienttimezoneoffset} = req.query;
  clienttimezoneoffset = Number(clienttimezoneoffset);
  clienttimezoneoffset = Number.isNaN(clienttimezoneoffset) ? 0 : clienttimezoneoffset;
  const clientTimezoneOffset = clienttimezoneoffset * 60 * 1000;


  res.render('projects/editBasic', {
    project,
    clientTimezoneOffset,
  });
};


// Actualizar proyecto
exports.updateBasic = async (req, res, next) => {

  const {body} = req;
  const {project} = req.load;

  let {clientTimezoneOffset} = body;
  clientTimezoneOffset = Number(clientTimezoneOffset);
  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  project.title = body.title;
  project.summary = body.summary;
  project.description = body.description;
  project.url = body.url;
  project.budget = body.budget;
  project.currency = body.currency;
  project.deliveryDate = new Date(body.deliveryDate).valueOf() + clientTimezoneOffset - serverTimezoneOffset;

  try {
    await project.save();
    console.log('Project edited successfully.');

    res.redirect('/projects/' + project.id + '/objectives_constraints/edit');

  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('projects/editBasic', {
        project,
        clientTimezoneOffset,
      });
    } else {
      next(error);
    }
  }
};

// Eliminar proyecto
exports.destroy = async (req, res, next) => {

  const {project} = req.load;

  try {
    await project.destroy();
    console.log('Project deleted successfully.');
    res.redirect('/projects');
  } catch (error) {
    next(error);
  }
};


// Publicar el proyecto: estado = pending
exports.projectSubmit = async (req, res, next) => {

  const {project} = req.load;

  const clientId = req.session.loginUser?.clientId;

  project.state = states.ProjectState.Pending;

  try {
    // Save into the data base
    await project.save();
    console.log('Success: Project submitted successfully.');

    if (clientId) {
      res.redirect('/clients/' + clientId + '/projects');
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// Publicar el scope: estado = validationNeeded
exports.scopeSubmit = async (req, res, next) => {

  const {project} = req.load;

  const developerId = req.session.loginUser?.developerId;

  project.state = states.ProjectState.ValidationNeeded;

  try {
    // Save into the data base
    await project.save();
    console.log('Success: Scope submitted successfully.');

    if (developerId) {
      res.redirect('/developers/' + developerId + '/projects');
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// Aceptar el scope: estado = taskingInProgress
exports.scopeAccept = async (req, res, next) => {

  const {project} = req.load;

  const developerId = req.session.loginUser?.developerId;

  project.state = states.ProjectState.TaskingInProgress;

  try {
    // Save into the data base
    await project.save();
    console.log('Success: Scope accepted successfully.');

    if (developerId) {
      res.redirect('/developers/' + developerId + '/projects');
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// Rechazar el scope: estado = scopingInProgress
exports.scopeReject = async (req, res, next) => {

  const {project} = req.load;

  const developerId = req.session.loginUser?.developerId;

  project.state = states.ProjectState.ScopingInProgress;

  try {
    // Save into the data base
    await project.save();
    console.log('Success: Scope rechazados successfully.');

    if (developerId) {
      res.redirect('/developers/' + developerId + '/projects');
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};

// Rechazar el proyecto: estado = rejected
exports.reject = async (req, res, next) => {

  const {project} = req.load;

  project.state = states.ProjectState.Rejected;

  try {
    // Save into the data base
    await project.save();
    console.log('Success: Project rejected successfully.');
      res.redirect('/projects/' + project.id);
  } catch (error) {
    next(error);
  }
};


// Aprobar el proyecto: estado = rejected
exports.approve = async (req, res, next) => {

  const {project} = req.load;

  project.state = states.ProjectState.Approved;

  try {
    // Save into the data base
    await project.save();
    console.log('Success: Project approved successfully.');
    res.redirect('/projects/' + project.id);
  } catch (error) {
    next(error);
  }
};


// Mostrar Formulario para editar Objectives y Constraints
exports.editObjectivesConstraints = async (req, res) => {

  const {project} = req.load;

  // Timezone offset del cliente
  let {clienttimezoneoffset} = req.query;
  clienttimezoneoffset = Number(clienttimezoneoffset);
  clienttimezoneoffset = Number.isNaN(clienttimezoneoffset) ? 0 : clienttimezoneoffset;
  const clientTimezoneOffset = clienttimezoneoffset * 60 * 1000;


  res.render('projects/editObjectivesConstraints', {
    project,
    clientTimezoneOffset,
  });
};


// Mostrar formulario para seleccioanr consultor
exports.selectConsultant = async (req, res, next) => {

  const {project} = req.load;

  const allDevelopers = await Developer.findAll();

  res.render('projects/selectConsultant', {
    project,
    allDevelopers
  });
};


// Actualizar consultor del proyecto
exports.setConsultant = async (req, res, next) => {

  const {body} = req;
  const {project} = req.load;

  project.consultantId =  body.consultantId;
  project.state =  states.ProjectState.ScopingInProgress;

  try {
    await project.save();
    console.log('Project consultant assigned successfully.');

    res.redirect('/projects/' + project.id);

  } catch (error) {
    next(error);
  }
};

const createError = require('http-errors');
const Sequelize = require("sequelize");

const states = require("./state");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    Objective, Constraint, Milestone, Task, Role, Comment
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
        {model: Objective, as: 'objectives',
          separate: true,
          order: [['displayOrder', 'ASC']] },
        {model: Constraint, as: 'constraints',
          separate: true,
          order: [['displayOrder', 'ASC']] },
        {
          model: Milestone, as: 'milestones',
          separate: true,
          order: [['displayOrder', 'ASC']],
          include: [
            {model: Task, as: 'tasks',
              separate: true,
              order: [['displayOrder', 'ASC']],
              include: [
                {model: Role, as: 'role'}
              ]
            }
          ]
        },
        {model: Comment, as: "comments",
          separate: true,
          order: [['createdAt', 'DESC']],
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


// Listar todos los proyectos o los de un cliente o los de un developer
// GET + /projects
// GET + /clients/:clientId/projects
// GET + /developers/:developerId/projects
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

    // No se puede usar el valor client en las opciones cuando
    // hay llamadas anidadas a la fumcion include de EJS.
    res.render('projects/index', {projects, c: client, developer});
  } catch (error) {
    next(error);
  }
};


// Mostrar formulario de creación
exports.newProposal = (req, res, next) => {

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
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;

  res.render('projects/newProposal', {
    project,
    browserTimezoneOffset,
  });
};

// Crear proyecto
exports.createProposal = async (req, res, next) => {

  let {title, summary, description, url, budget, currency, deliveryDate} = req.body;

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  deliveryDate = new Date(deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset;

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

      res.render('projects/newProposal', {
        project,
        browserTimezoneOffset,
      });
    } else {
      next(error);
    }
  }

};

// Mostrar detalle de un proyecto
exports.show = async (req, res, next) => {

  const {project} = req.load;

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;

  if (project.state) {
    res.render('projects/overview', {
      project,
      browserTimezoneOffset,
    });
  } else {
    res.render('projects/show', {
      project,
      browserTimezoneOffset,
    });
  }
};


// Mostrar formulario de edición
exports.editProposal = async (req, res, next) => {

  const {project} = req.load;

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;


  res.render('projects/editProposal', {
    project,
    browserTimezoneOffset,
  });
};


// Actualizar proyecto
exports.updateProposal = async (req, res, next) => {

  const {body} = req;
  const {project} = req.load;

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  project.title = body.title;
  project.summary = body.summary;
  project.description = body.description;
  project.url = body.url;
  project.budget = body.budget;
  project.currency = body.currency;
  project.deliveryDate = new Date(body.deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset;

  try {
    await project.save();
    console.log('Project edited successfully.');

    res.redirect('/projects/' + project.id + '/objectives_constraints/edit');

  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('projects/editProposal', {
        project,
        browserTimezoneOffset,
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

  let {project} = req.load;

  const developerId = req.session.loginUser?.developerId;

  project.state = states.ProjectState.ValidationNeeded;

  const consultantComment = req.body.consultantComment || "";

  try {
    // Save into the data base
    project = await project.save();

    const comment = await Comment.create({consultantComment});

    project.addComment(comment);

    console.log('Success: Scope submitted successfully.');

    if (developerId) {
      res.redirect('/projects/' + project.id);
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// Aceptar el scope: estado = taskingInProgress
exports.scopeAccept = async (req, res, next) => {

  let {project} = req.load;
  let [comment] = project.comments;

  const clientId = req.session.loginUser?.clientId;

  project.state = states.ProjectState.TasksPending;

  const clientResponse = req.body.clientResponse || "Genial no, lo siguiente."

  try {
    // Save into the data base
    project = await project.save();

    await comment.update({clientResponse});

    console.log('Success: Scope accepted successfully.');

    if (clientId) {
      res.redirect('/projects/' + project.id);
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// Rechazar el scope: estado = scopingInProgress
exports.scopeReject = async (req, res, next) => {

  let {project} = req.load;
  let [comment] = project.comments;

  const clientId = req.session.loginUser?.clientId;

  project.state = states.ProjectState.ScopingInProgress;

  const clientResponse = req.body.clientResponse || "Peor imposible."

  try {
    // Save into the data base
    project = await project.save();

    await comment.update({clientResponse});

    console.log('Success: Scope rechazados successfully.');

    if (clientId) {
      res.redirect('/projects/' + project.id);
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


// Mostrar Formulario para editar objectives y Constraints
exports.editObjectivesConstraints = async (req, res) => {

  const {project} = req.load;

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;


  res.render('projects/editObjectivesConstraints', {
    project,
    browserTimezoneOffset,
  });
};


// Mostrar formulario para seleccioanr consultor
exports.selectConsultant = async (req, res, next) => {

  const {project} = req.load;

  const allDevelopers = await Developer.findAll();

  res.render('consultants/select', {
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

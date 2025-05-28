const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {Project, Client, User, Attachment,
  ProjectObjective, ProjectConstraint, Milestone, Task}} = require('../models');


// Autoload la task asociado a :taskId
exports.load = async (req, res, next, taskId) => {

  try {
    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Milestone, as: 'milestone',
          include: [
            {model: Project, as: 'project'}
          ]
        }
      ],
    });
    if (task) {
      req.load = {...req.load, task};
      next();
    } else {
      throw createError(404, 'There is no task with id=' + taskId);
    }
  } catch (error) {
    next(error);
  }
};


// Listar todos las tasks de un milestone
exports.index = async (req, res, next) => {

  try {
    const {project, milestone} = req.load;

    res.render('tasks/index', {project, milestone});
  } catch (error) {
    next(error);
  }
};


// Mostrar formulario de creación de una task§ milestone
exports.new = (req, res, next) => {

  const {project, milestone} = req.load;

  const task = {
    title: "",
    description: "",
    budget: "",
    currency: "",
    deliveryDate: Date.now() + 60 * 60 * 1000,
    roleId
  };

  // Timezone offset del cliente
  let {clienttimezoneoffset} = req.query;
  clienttimezoneoffset = Number(clienttimezoneoffset);
  clienttimezoneoffset = Number.isNaN(clienttimezoneoffset) ? 0 : clienttimezoneoffset;
  const clientTimezoneOffset = clienttimezoneoffset * 60 * 1000;

  res.render('tasks/new', {
    task,
    milestone,
    project,
    clientTimezoneOffset,
  });
};



// Crear task
exports.create = async (req, res, next) => {

  const {project, milestone} = req.load;

  let {title, description, budget, currency, deliveryDate, roleId} = req.body;

  let {clientTimezoneOffset} = req.body;
  clientTimezoneOffset = Number(clientTimezoneOffset);
  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  deliveryDate = new Date(deliveryDate).valueOf() + clientTimezoneOffset - serverTimezoneOffset;

  const milestoneId = milestone.id;

  let task = Task.build({
    title,
    description,
    budget,
    currency,
    deliveryDate,
    roleId});

  try {
    // Save into the data base
    task = await task.save();
    console.log('Success: Task created successfully.');
    res.redirect('/projects/' + projectId + '/milestones' + milestoneId + '/tasks');
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('tasks/new', {
        task,
        milestone,
        project,
        clientTimezoneOffset,
      });
    } else {
      next(error);
    }
  }
};


// Mostrar formulario de edición
exports.edit = async (req, res) => {

  const {project, milestone, task} = req.load;

  // Timezone offset del cliente
  let {clienttimezoneoffset} = req.query;
  clienttimezoneoffset = Number(clienttimezoneoffset);
  clienttimezoneoffset = Number.isNaN(clienttimezoneoffset) ? 0 : clienttimezoneoffset;
  const clientTimezoneOffset = clienttimezoneoffset * 60 * 1000;


  res.render('tasks/edit', {
    task,
    milestone,
    project,
    clientTimezoneOffset,
  });
};


// Actualizar task
exports.update = async (req, res) => {

  const {body} = req;
  const {project, milestone, task} = req.load;

  let {clientTimezoneOffset} = body;
  clientTimezoneOffset = Number(clientTimezoneOffset);
  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  task.title = body.title;
  task.description = body.description;
  task.budget = body.budget;
  task.currency = body.currency;
  task.deliveryDate = new Date(body.deliveryDate).valueOf() + clientTimezoneOffset - serverTimezoneOffset;
  task.roleId = body.roleId;

  try {
    await task.save();
    console.log('Task edited successfully.');
    res.redirect('/projects/' + project.id + '/milestones' + milestone.id + '/tasks');
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('tasks/edit', {
        task,
        milestone,
        project,
        clientTimezoneOffset,
      });
    } else {
      next(error);
    }
  }
};


// Eliminar task
exports.destroy = async (req, res) => {

  const {project, milestone, task} = req.load;

  try {
    await task.destroy();
    console.log('Task deleted successfully.');
    res.redirect('/projects/' + project.id + '/milestones/' + milestone.id + '/tasks');
  } catch (error) {
    next(error);
  }
};


const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {Project, Client, User, Attachment,
  Objective, Constraint, Milestone, Task, Role}} = require('../models');
const sequelize = require("../models");
const states = require("./state");


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


// Editar todos las tasks de todos los milestone del project5o
exports.editAll = async (req, res, next) => {

  try {
    const {project} = req.load;

    res.render('tasks/editAll', {project});
  } catch (error) {
    next(error);
  }
};


// Mostrar todos las tasks de todos los milestone del project5o
exports.showAll = async (req, res, next) => {

  try {
    const {project} = req.load;

    res.render('tasks/showAll', {project});
  } catch (error) {
    next(error);
  }
};

// Mostrar formulario de creación de una task para un milestone
exports.new = async (req, res, next) => {

  const {project, milestone} = req.load;

  const allRoles = await Role.findAll();

  const task = {
    title: "",
    description: "",
    budget: "",
    currency: "",
    deliveryDate: Date.now() + 60 * 60 * 1000,
    roleId : 0
  };

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;

  res.render('tasks/new', {
    task,
    milestone,
    project,
    allRoles,
    browserTimezoneOffset,
  });
};



// Crear task
exports.create = async (req, res, next) => {

  const {project, milestone} = req.load;

  let {title, description, budget, currency, deliveryDate, roleId} = req.body;

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  deliveryDate = new Date(deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset;

  const milestoneId = milestone.id;

  let task = Task.build({
    title,
    description,
    budget,
    currency,
    deliveryDate});

  try {
    // Save into the data base
    task = await task.save();

    if (roleId) {
      task = await task.setRole(roleId);
    }

    await milestone.addTask(task);
    console.log('Success: Task created successfully.');
    res.redirect('/projects/' + project.id + '/tasks/edit');
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('tasks/new', {
        task,
        milestone,
        project,
        browserTimezoneOffset,
      });
    } else {
      next(error);
    }
  }
};


// Mostrar formulario de edición
exports.edit = async (req, res) => {

  const {project, milestone, task} = req.load;

  const allRoles = await Role.findAll();

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;


  res.render('tasks/edit', {
    task,
    milestone,
    project,
    allRoles,
    browserTimezoneOffset,
  });
};


// Actualizar task
exports.update = async (req, res) => {

  const {body} = req;
  const {project, milestone, task} = req.load;

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  task.title = body.title;
  task.description = body.description;
  task.budget = body.budget;
  task.currency = body.currency;
  task.deliveryDate = new Date(body.deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset;
  task.roleId = body.roleId;

  try {
    await task.save();
    console.log('Task edited successfully.');
    res.redirect('/projects/' + project.id + '/tasks/edit');
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('tasks/edit', {
        task,
        milestone,
        project,
        allRoles,
        browserTimezoneOffset,
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



// Intercambiar el orden de visualizacion de 2 tasks
exports.swapOrder = async (req, res, next) => {

  const {project} = req.load;

  const transaction = await sequelize.transaction();
  try {
    const task1 = await Task.findByPk(req.params.id1, {transaction});
    if (!task1) {
      throw new Error('Task 1 not found.');
    }

    const task2 = await Task.findByPk(req.params.id2, {transaction});
    if (!task2) {
      throw new Error('Task 2 not found.');
    }

    const displayOrder1 = task1.displayOrder;
    const displayOrder2 = task2.displayOrder;

    // Intercambiamos posiciones
    await task1.update({displayOrder: displayOrder2}, {transaction}),
      await task2.update({displayOrder: displayOrder1}, {transaction})

    console.log('Tasks swapped successfully.');
    res.redirect('/projects/' + project.id + '/tasks');

    await transaction.commit();

  } catch
    (error) {
    await transaction.rollback();
    next(error);
  }
};



// Publicar las tasks creadas
exports.sendTasks = async (req, res, next) => {

  const {project} = req.load;

  const developerId = req.session.loginUser?.developerId;

  project.state = states.ProjectState.TeamAssignmentPending;

  try {
    // Save into the data base
    await project.save();
    console.log('Success: Tasks submitted successfully.');

    if (developerId) {
      res.redirect('/projects/' + project.id);
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


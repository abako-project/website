const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {Project, Client, User, Attachment,
  ProjectObjective, ProjectConstraint, Milestone, Task}} = require('../models');

const sequelize = require('../models');

// Autoload el milestone asociado a :milestoneId
exports.load = async (req, res, next, milestoneId) => {

  try {
    const milestone = await Milestone.findByPk(milestoneId, {
      include: [
        {model: Project, as: 'project'},
        {model: Task, as: 'tasks'}
      ],
    });
    if (milestone) {
      req.load = {...req.load, milestone};
      next();
    } else {
      throw createError(404, 'There is no milestone with id=' + milestoneId);
    }
  } catch (error) {
    next(error);
  }
};



// Listar todos los milestones de un proyecto
exports.index = async (req, res, next) => {

  try {
    const {project} = req.load;

    res.render('milestones/index', {project});
  } catch (error) {
    next(error);
  }
};

// Mostrar formulario de creación de un milestone
exports.new = (req, res, next) => {

  const {project} = req.load;

  const milestone = {
    title: "",
    description: "",
    budget: "",
    currency: "",
    deliveryDate: Date.now() + 60 * 60 * 1000
  };

  // Timezone offset del cliente
  let {clienttimezoneoffset} = req.query;
  clienttimezoneoffset = Number(clienttimezoneoffset);
  clienttimezoneoffset = Number.isNaN(clienttimezoneoffset) ? 0 : clienttimezoneoffset;
  const clientTimezoneOffset = clienttimezoneoffset * 60 * 1000;

  res.render('milestones/new', {
    milestone,
    project,
    clientTimezoneOffset,
  });
};



// Crear milestone
exports.create = async (req, res, next) => {

  const {project} = req.load;

  let {title, description, budget, currency, deliveryDate} = req.body;

  let {clientTimezoneOffset} = req.body;
  clientTimezoneOffset = Number(clientTimezoneOffset);
  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  deliveryDate = new Date(deliveryDate).valueOf() + clientTimezoneOffset - serverTimezoneOffset;

  const projectId = project.id;

  let milestone = Milestone.build({
    title,
    description,
    budget,
    currency,
    deliveryDate,
    projectId
  });

  try {
    // Save into the data base
    milestone = await milestone.save();
    console.log('Success: Milestone created successfully.');
    res.redirect('/projects/' + projectId + '/milestones');
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('milestones/new', {
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

  const {project, milestone} = req.load;

  // Timezone offset del cliente
  let {clienttimezoneoffset} = req.query;
  clienttimezoneoffset = Number(clienttimezoneoffset);
  clienttimezoneoffset = Number.isNaN(clienttimezoneoffset) ? 0 : clienttimezoneoffset;
  const clientTimezoneOffset = clienttimezoneoffset * 60 * 1000;


  res.render('milestones/edit', {
    project,
    milestone,
    clientTimezoneOffset,
  });
};


// Actualizar milestone
exports.update = async (req, res) => {

  const {body} = req;
  const {project, milestone} = req.load;

  let {clientTimezoneOffset} = body;
  clientTimezoneOffset = Number(clientTimezoneOffset);
  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  milestone.title = body.title;
  milestone.description = body.description;
  milestone.budget = body.budget;
  milestone.currency = body.currency;
  milestone.deliveryDate = new Date(body.deliveryDate).valueOf() + clientTimezoneOffset - serverTimezoneOffset;

  try {
    await milestone.save();
    console.log('Milestone edited successfully.');
    res.redirect('/projects/' + project.id + '/milestones');
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('milestones/edit', {
        project,
        milestone,
        clientTimezoneOffset,
      });
    } else {
      next(error);
    }
  }
};


// Eliminar milestone
exports.destroy = async (req, res, next) => {

  const {project, milestone} = req.load;

  try {
    await milestone.destroy();
    console.log('Milestone deleted successfully.');
    res.redirect('/projects/' + project.id + '/milestones');
  } catch (error) {
    next(error);
  }
};


// Intercambiar el orden de visualizacion de 2 milestones
exports.swapOrder = async (req, res, next) => {

  const transaction = await sequelize.transaction();
  try {
    const milestone1 = await Milestone.findByPk(req.params.id1, {transaction});
    if (!milestone1) {
      throw new Error('Milestone 1 not found.');
    }

    const milestone2 = await Milestone.findByPk(req.params.id2, {transaction});
    if (!milestone2) {
      throw new Error('Milestone 2 not found.');
    }

    const displayOrder1 = milestone1.displayOrder;
    const displayOrder2 = milestone2.displayOrder;

    // Intercambiamos posiciones
      await milestone1.update({displayOrder: displayOrder2}, {transaction}),
      await milestone2.update({displayOrder: displayOrder1}, {transaction})

    console.log('Milestones swapped successfully.');
    res.redirect('/projects/' + milestone1.projectId + '/milestones');

    await transaction.commit();

  } catch
    (error) {
    await transaction.rollback();
    next(error);
  }
};

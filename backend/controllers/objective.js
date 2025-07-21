const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {Project, Client, User, Attachment, Objective}} = require('../models');
const sequelize = require("../models");


// Autoload el objectivo asociado a :objectiveId
exports.load = async (req, res, next, objectiveId) => {

  try {
    const objective = await Objective.findByPk(objectiveId);
    if (objective) {
      req.load = {...req.load, objective};
      next();
    } else {
      throw createError(404, 'There is no objective with id=' + objectiveId);
    }
  } catch (error) {
    next(error);
  }
};


// Crear objectivo
exports.create = async (req, res, next) => {

  let {description} = req.body;
  let {project} = req.load;
  
  let objective = Objective.build({description});

  try {
    // Save into the data base
    objective = await objective.save();

    await project.addObjective(objective);
    console.log('Success: Project Objective created successfully.');

    res.redirect('/projects/' + project.id + '/objectives_constraints/edit');


  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.redirect('/projects/' + project.id + '/objectives_constraints/edit');

    } else {
      next(error);
    }
  }
};


// Eliminar objectivo
exports.destroy = async (req, res) => {

  const {project, objective} = req.load;

  try {
    await objective.destroy();
    console.log('Objective deleted successfully.');
    res.redirect('/projects/' + project.id + '/objectives_constraints/edit');
  } catch (error) {
    next(error);
  }
};


// Intercambiar el orden de visualizacion de 2 objectives
exports.swapOrder = async (req, res, next) => {

  const transaction = await sequelize.transaction();
  try {
    const objective1 = await Objective.findByPk(req.params.id1, {transaction});
    if (!objective1) {
      throw new Error('Objective 1 not found.');
    }

    const objective2 = await Objective.findByPk(req.params.id2, {transaction});
    if (!objective2) {
      throw new Error('Objective 2 not found.');
    }

    const displayOrder1 = objective1.displayOrder;
    const displayOrder2 = objective2.displayOrder;

    // Intercambiamos posiciones
    await objective1.update({displayOrder: displayOrder2}, {transaction}),
      await objective2.update({displayOrder: displayOrder1}, {transaction})

    console.log('Objectives swapped successfully.');
    res.redirect('/projects/' + objective1.projectId + '/objectives_constraints/edit');

    await transaction.commit();

  } catch
    (error) {
    await transaction.rollback();
    next(error);
  }
};

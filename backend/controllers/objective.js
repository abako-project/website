const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {Project, Client, User, Attachment, ProjectObjective}} = require('../models');


// Autoload el objectivo asociado a :objectiveId
exports.load = async (req, res, next, objectiveId) => {

  try {
    const objective = await ProjectObjective.findByPk(objectiveId);
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
  
  let objective = ProjectObjective.build({description});

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


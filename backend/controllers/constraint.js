const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {Constraint}} = require('../models');
const sequelize = require("../models");


// Autoload el objetivo asociado a :constraintId
exports.load = async (req, res, next, constraintId) => {

    try {
        const constraint = await Constraint.findByPk(constraintId);
        if (constraint) {
            req.load = {...req.load, constraint};
            next();
        } else {
            throw createError(404, 'There is no constraint with id=' + constraintId);
        }
    } catch (error) {
        next(error);
    }
};


// Crear constraint
exports.create = async (req, res, next) => {

    let {description} = req.body;
    let {project} = req.load;

    let constraint = Constraint.build({description});

    try {
        // Save into the data base
        constraint = await constraint.save();

        await project.addConstraint(constraint);
        console.log('Success: Project constraint created successfully.');

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


// Eliminar constraint
exports.destroy = async (req, res) => {

    const {project, constraint} = req.load;

    try {
        await constraint.destroy();
        console.log('Constraint deleted successfully.');
        res.redirect('/projects/' + project.id + '/objectives_constraints/edit');
    } catch (error) {
        next(error);
    }
};


// Intercambiar el orden de visualizacion de 2 constraints
exports.swapOrder = async (req, res, next) => {

    const transaction = await sequelize.transaction();
    try {
        const constraint1 = await Constraint.findByPk(req.params.id1, {transaction});
        if (!constraint1) {
            throw new Error('Constraint 1 not found.');
        }

        const constraint2 = await Constraint.findByPk(req.params.id2, {transaction});
        if (!constraint2) {
            throw new Error('Constraint 2 not found.');
        }

        const displayOrder1 = constraint1.displayOrder;
        const displayOrder2 = constraint2.displayOrder;

        // Intercambiamos posiciones
        await constraint1.update({displayOrder: displayOrder2}, {transaction}),
          await constraint2.update({displayOrder: displayOrder1}, {transaction})

        console.log('Constraints swapped successfully.');
        res.redirect('/projects/' + constraint1.projectId + '/objectives_constraints/edit');

        await transaction.commit();

    } catch
      (error) {
        await transaction.rollback();
        next(error);
    }
};

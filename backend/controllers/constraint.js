const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {ProjectConstraint}} = require('../models');


// Autoload el objetivo asociado a :constraintId
exports.load = async (req, res, next, constraintId) => {

    try {
        const constraint = await ProjectConstraint.findByPk(constraintId);
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

    let constraint = ProjectConstraint.build({description});

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


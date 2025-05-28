const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {Role}} = require('../models');


// Autoload el role asociado a :roleId
exports.load = async (req, res, next, roleId) => {

    try {
        const role = await Role.findByPk(roleId);
        if (role) {
            req.load = {...req.load, role};
            next();
        } else {
            throw createError(404, 'There is no role with id=' + roleId);
        }
    } catch (error) {
        next(error);
    }
};


// Listar todos los roles
exports.index = async (req, res, next) => {

    try {
        const roles = await Role.findAll();

        res.render('roles/index', {roles});
    } catch (error) {
        next(error);
    }
};


// Mostrar formulario de creación
exports.new = (req, res, next) => {

    const role = {
        name: ""
    };

    res.render('roles/new', {
        role
    });
};

// Crear role
exports.create = async (req, res, next) => {

    let {name} = req.body;

    let role = Role.build({
        name
    });

    try {
        // Save into the data base
        role = await role.save();
        console.log('Success: Role created successfully.');
        res.redirect('/roles');
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            req.flash('error', 'Error: There are errors in the form:');
            error.errors.forEach(({message}) => req.flash('error', message));

            res.render('roles/new', {
                role
            });
        } else {
            next(error);
        }
    }

};

// Mostrar detalle de un role
exports.show = async (req, res) => {

    const {role} = req.load;

    res.render('roles/show', {
        role
    });
};


// Mostrar formulario de edición
exports.edit = async (req, res) => {

    const {role} = req.load;

    res.render('roles/edit', {
        role
    });
};


// Actualizar role
exports.update = async (req, res) => {

    const {body} = req;
    const {role} = req.load;

    role.name = body.name;

    try {
        await role.save();
        console.log('Role edited successfully.');
        res.redirect('/roles');
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            req.flash('error', 'Error: There are errors in the form:');
            error.errors.forEach(({message}) => req.flash('error', message));

            res.render('roles/edit', {
                role
            });
        } else {
            next(error);
        }
    }
};

// Eliminar role
exports.destroy = async (req, res) => {

    const {role} = req.load;

    try {
        await role.destroy();
        console.log('Role deleted successfully.');
        res.redirect('/roles');
    } catch (error) {
        next(error);
    }
};

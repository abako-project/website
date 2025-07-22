
const seda = require("../services/seda");


// Autoload el role asociado a :roleId
exports.load = async (req, res, next, roleId) => {

    try {
        const role = await seda.role(roleId);

        req.load = {...req.load, role};
        next();

    } catch (error) {
        next(error);
    }
};


// Listar todos los roles
exports.index = async (req, res, next) => {

    try {
        const roles = await seda.roleIndex();

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

    let role = {
        name
    };

    try {
        role = await seda.roleCreate(name);

        console.log('Success: Role created successfully.');
        res.redirect('/roles');
    } catch (error) {
        if (error instanceof seda.ValidationError) {
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
exports.show = async (req, res, next) => {

    try {
        const {role} = req.load;

        res.render('roles/show', {
            role
        });
    } catch (error) {
        next(error);
    }
};


// Mostrar formulario de edición
exports.edit = async (req, res) => {

    const {role} = req.load;

    res.render('roles/edit', {
        role
    });
};


// Actualizar role
exports.update = async (req, res, next) => {

    const {body} = req;
    const {role} = req.load;

    role.name = body.name;

    try {
        await seda.roleUpdate(role.id, role);

        console.log('Role edited successfully.');
        res.redirect('/roles');
    } catch (error) {
        if (error instanceof seda.ValidationError) {
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
exports.destroy = async (req, res, next) => {

    const {role} = req.load;

    try {
        await seda.roleDestroy(role.id);

        console.log('Role deleted successfully.');
        res.redirect('/roles');
    } catch (error) {
        next(error);
    }
};



const authClient = require("./client");
const authDeveloper = require("./developer");

// --------- PERMISOS

// Middleware: autenticación requerida
exports.isAuthenticated = (req, res, next) => {
    if (req.session.loginUser) return next();
    req.flash("info", "Login required: log in and retry.");
    res.redirect('/auth/login');
};

// MW that allows to pass only if the logged in user is admin
exports.adminRequired = (req, res, next) => {

    const isAdmin = !!req.session.loginUser?.isAdmin;

    if (isAdmin) {
        next();
    } else {
        console.log('Prohibited route: it is not an administrator.');
        res.sendStatus(403);
    }
};
// --------- AREAS: Seleccionar cliente o desarrollador
exports.registerAreas = (req, res) => {
    res.render('areas/register');
};
exports.loginAreas = (req, res) => {
    res.render('areas/login');
};

//  --------- Registro de clientes:
exports.registerClientNew = (req, res) => {
    res.render('clients/register');
};
exports.registerClientCreate = authClient.registerCreate;

//  --------- Login de clientes:
exports.loginClientNew = (req, res) => {
    res.render('clients/login');
};
exports.loginClientCreate = authClient.loginCreate;

//  --------- Registro de desarrollador:
exports.registerDeveloperNew = (req, res) => {
    res.render('developers/register');
};
exports.registerDeveloperCreate = authDeveloper.registerCreate;

//  --------- Login de desarrollador:
exports.loginDeveloperNew = (req, res) => {
    res.render('developers/login');
};
exports.loginDeveloperCreate = authDeveloper.loginCreate;


// --------- LOGOUT
exports.logout = (req, res) => {

    delete req.session.loginUser;

    res.redirect("/auth/login"); // redirect to login gage
};


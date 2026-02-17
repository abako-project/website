

const authClient = require("./client");
const authDeveloper = require("./developer");


// --------- AREAS: Seleccionar cliente o desarrollador
exports.registerAreas = (req, res) => {
    res.render('auth/areas/register', {layout: "layouts/layout"});
};
exports.loginAreas = (req, res) => {
    res.render('auth/areas/login', {layout: "layouts/layout"});
};

//  --------- Registro de clientes:
exports.registerClientNew = (req, res) => {
    res.render('clients/register', {layout: "layouts/layout"});
};
exports.registerClientCreate = authClient.registerCreate;

//  --------- Login de clientes:
exports.loginClientNew = (req, res) => {
    res.render('clients/login', {layout: "layouts/layout"});
};
exports.loginClientCreate = authClient.loginCreate;

//  --------- Registro de desarrollador:
exports.registerDeveloperNew = authDeveloper.registerNew;
exports.registerDeveloperCreate = authDeveloper.registerCreate;
exports.registerDeveloperProfileEdit = authDeveloper.registerProfileEdit;
exports.registerDeveloperProfileUpdate = authDeveloper.registerProfileUpdate;
exports.registerDeveloperDone = authDeveloper.registerDone;

//  --------- Login de desarrollador:
exports.loginDeveloperNew = authDeveloper.loginNew;
exports.loginDeveloperCreate = authDeveloper.loginCreate;


// --------- LOGOUT
exports.logout = (req, res) => {

    delete req.session.loginUser;

    res.redirect("/auth/login"); // redirect to login gage
};


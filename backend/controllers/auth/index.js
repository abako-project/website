

const authClient = require("./client");
const authDeveloper = require("./developer");


// --------- AREAS: Seleccionar cliente o desarrollador
exports.registerAreas = (req, res) => {
    res.render('areas/register', {layout: "layouts/layout"});
};
exports.loginAreas = (req, res) => {
    res.render('areas/login', {layout: "layouts/layout"});
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
exports.registerDeveloperNew = (req, res) => {
    res.render('developers/register', {layout: "layouts/layout"});
};
exports.registerDeveloperCreate = authDeveloper.registerCreate;

//  --------- Login de desarrollador:
exports.loginDeveloperNew = (req, res) => {
    res.render('developers/login', {layout: "layouts/layout"});
};
exports.loginDeveloperCreate = authDeveloper.loginCreate;


// --------- LOGOUT
exports.logout = (req, res) => {

    delete req.session.loginUser;

    res.redirect("/auth/login"); // redirect to login gage
};


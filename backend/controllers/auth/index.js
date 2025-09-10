

const authClient = require("./client");
const authDeveloper = require("./developer");


// --------- AREAS: Seleccionar cliente o desarrollador
exports.registerAreas = (req, res) => {
    res.render('areas/register', {layout: "layouts/layoutOnboarding"});
};
exports.loginAreas = (req, res) => {
    res.render('areas/login', {layout: "layouts/layoutOnboarding"});
};

//  --------- Registro de clientes:
exports.registerClientNew = (req, res) => {
    res.render('clients/register', {layout: "layouts/layoutOnboarding"});
};
exports.registerClientCreate = authClient.registerCreate;

//  --------- Login de clientes:
exports.loginClientNew = (req, res) => {
    res.render('clients/login', {layout: "layouts/layoutOnboarding"});
};
exports.loginClientCreate = authClient.loginCreate;

//  --------- Registro de desarrollador:
exports.registerDeveloperNew = (req, res) => {
    res.render('developers/register', {layout: "layouts/layoutOnboarding"});
};
exports.registerDeveloperCreate = authDeveloper.registerCreate;

//  --------- Login de desarrollador:
exports.loginDeveloperNew = (req, res) => {
    res.render('developers/login', {layout: "layouts/layoutOnboarding"});
};
exports.loginDeveloperCreate = authDeveloper.loginCreate;


// --------- LOGOUT
exports.logout = (req, res) => {

    delete req.session.loginUser;

    res.redirect("/auth/login"); // redirect to login gage
};


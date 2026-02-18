

const authClient = require("./client");
const authDeveloper = require("./developer");


// --------- AREAS: Select register area o login area

exports.registerAreas = (req, res) => {
    res.render('auth/areas/register', {layout: "layouts/layout"});
};
exports.loginAreas = (req, res) => {
    res.render('auth/areas/login', {layout: "layouts/layout"});
};


// ----- REGISTER --------

//  --------- Registro de clientes:
exports.registerClientNew = authClient.registerNew;
exports.registerClientCreate = authClient.registerCreate;
exports.registerClientProfileEdit = authClient.registerProfileEdit;
exports.registerClientProfileUpdate = authClient.registerProfileUpdate;
exports.registerClientDone = authClient.registerDone;

//  --------- Registro de desarrollador:
exports.registerDeveloperNew = authDeveloper.registerNew;
exports.registerDeveloperCreate = authDeveloper.registerCreate;
exports.registerDeveloperProfileEdit = authDeveloper.registerProfileEdit;
exports.registerDeveloperProfileUpdate = authDeveloper.registerProfileUpdate;
exports.registerDeveloperDone = authDeveloper.registerDone;


// ----- LOGIN --------

//  --------- Login de clientes:
exports.loginClientNew = authClient.loginNew;
exports.loginClientCreate = authClient.loginCreate;

//  --------- Login de desarrollador:
exports.loginDeveloperNew = authDeveloper.loginNew;
exports.loginDeveloperCreate = authDeveloper.loginCreate;


// --------- LOGOUT  --------

exports.logout = (req, res) => {

    delete req.session.loginUser;

    res.redirect("/auth/login"); // redirect to login gage
};


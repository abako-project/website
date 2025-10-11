"use strict";

const seda = require("../services/seda");

// Menu inicial
exports.index = async (req, res) => {
  res.render('backdoor');
};

// Login como Admin
exports.adminLogin = async (req, res) => {

  // Guardar la zona horaria del navegador y del servidor en la session
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
  req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  req.session.loginUser = {
    id: 0,
    email: "admin@sitio.es",
    name: "admin",
    isAdmin: true,
    clientId: undefined,
    developerId: undefined
  };

  res.redirect(`/projects`);
};



// Login de un cliente
exports.clientLogin = async (req, res, next) => {

  // Guardar la zona horaria del navegador y del servidor en la session
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
  req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

    const {email} = req.params;

  try {
    const client = await seda.clientFindByEmail(email);

    if (!client) {
        return next(`No encuentro un cliente con el email ${email}.`);
    }

    req.session.loginUser = {
      id: client.user.id,
      email: client.user.email,
      name: client.name,
      clientId: client.id,
      developerId: undefined
    };

    res.redirect(`/clients/${client.id}/projects`);
  } catch (error) {
    console.log('Error: An error has occurred: ' + error);
    next(error);
  }
};



// Login de un developer
exports.developerLogin = async (req, res, next) => {

    // Guardar la zona horaria del navegador y del servidor en la session
    let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
    req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
    req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

    const {email} = req.params;

    try {
        const developer = await seda.developerFindByEmail(email);

        if (!developer) {
            return next(`No encuentro un desarrollador con el email ${email}.`);
        }

        req.session.loginUser = {
            id: developer.user.id,
            email: developer.user.email,
            name: developer.name,
            clientId: undefined,
            developerId: developer.id
        };

        res.redirect(`/developers/${developer.id}/projects`);
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};


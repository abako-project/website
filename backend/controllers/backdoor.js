"use strict";

const {models: {User, Client, Developer}} = require('../models');


// Menu inicial
exports.index = async (req, res) => {
  res.render('backdoor');
};

exports.users = async (req, res) => {

  const clients = await Client.findAll({
    include: [{model: User, as: "user"}]
  });

  const developers = {};

  res.render('backdoor/users', {clients, developers});
};


// Login como Admin
exports.adminLogin = async (req, res) => {

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



// Login como el cliente Carlos
exports.carlosLogin = async (req, res) => {

  const email = "carlos@sitio.es";

  try {
    const user = await User.findOne({
      where: {email},
      include: [{model: Client, as: "client"}]
    });

    if (!user || !user.client) {
        return next("No encuentro a Carlos.");
    }

    req.session.loginUser = {
      id: user.id,
      email: user.email,
      clientId: user.client.id,
      developerId: undefined
    };

    res.redirect(`/clients/${user.client.id}/projects`);
  } catch (error) {
    console.log('Error: An error has occurred: ' + error);
    next(error);
  }
};


// Login como el developer Daniela
exports.danielaLogin = async (req, res) => {

    const email = "daniela@sitio.es";

    try {
        const user = await User.findOne({
            where: {email},
            include: [{model: Developer, as: "developer"},]
        });

        if (!user || !user.developer) {
            return next("No encuentro a Daniela.");
        }

        req.session.loginUser = {
            id: user.id,
            email: user.email,
            clientId: undefined,
            developerId: user.developer.id
        };

      res.redirect(`/developers/${user.developer.id}/projects`);
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};


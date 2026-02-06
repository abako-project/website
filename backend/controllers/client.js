"use strict";
const languagesMap = require('../models/enums/languages.json');
const seda = require("../models/seda");

// Autoload the client with id equals to :clientId
exports.load = async (req, res, next, clientId) => {

    try {
        const client = await seda.client(clientId);

        req.load = {...req.load, client};
        next();

    } catch (error) {
        next(error);
    }
};

exports.index = async (req, res, next) => {

  try {
    const clients = await seda.clientIndex();
        res.render('clients/index', {clients});
    } catch (error) {
        next(error);
    }
};

// GET /clients/:clientId/profile
exports.show = async (req, res, next) => {
    try {
        const {client} = req.load;
        const avatarUrl = `/clients/${client.id}/attachment`;
        //Aún no hace nada porque no hay languages en clients
        const languageNames = client.languages?.map(code => languagesMap[code]) || [];

        res.render('clients/profile/show', {c: client, avatarUrl, languageNames});
    } catch (error) {
        next(error);
    }
};

// GET /clients/:clientId/profile/edit
exports.edit = async (req, res, next) => {

  const {client} = req.load;

  const allLanguages = Object.entries(languagesMap).map(([code, name]) => ({code,name}));

  // No se puede usar el valor client en las opciones cuando
  // hay llamadas anidadas a la fumcion include de EJS.
  res.render('clients/profile/edit', {c: client, allLanguages});
};


// PUT /clients/:clientId
exports.update = async (req, res, next) => {

    const {body} = req;
    const clientId = req.params.clientId;
    const {client} = req.load;

    const data = {
        name: body.name || 'name',
        company: body.company || 'company',
        department: body.department || 'department',
        website: body.website || 'website',
        description: body.description || 'description',
        location: body.location || 'location',
    };

    data.languages = Array.isArray(body.languages) ? body.languages : body.languages ? [body.languages] : ["none"];
    const image = req.file?.buffer || null;

    try {
        await seda.clientUpdate(clientId, data, image);
        console.log('Client edited successfully.');
        res.redirect('/clients/' + clientId + '/profile');
    } catch (error) {
        if (error instanceof seda.ValidationError) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));
            const allLanguages = Object.entries(languagesMap).map(([code, name]) => ({code,name}));
            res.render('clients/profile/edit', {c: client, allLanguages});
        } else {
            next(error);
        }
    }
};


// GET /clients/:clientId/attachment
exports.attachment = async (req, res, next) => {

    try {
        const clientId = req.params.clientId;

        const attachment = await seda.clientAttachment(clientId);

        if (!attachment || !attachment.image) {
            return res.redirect("/images/none.png");
        } else {
            res.type(attachment.mime);
            res.send(Buffer.from(attachment.image));
        }
    } catch (error) {
        next(error);
    }
};


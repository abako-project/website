"use strict";

const seda = require("../services/seda");

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




// GET /clients/:clientId/edit
exports.edit = (req, res, next) => {

    const {client} = req.load;

    // No se puede usar el valor client en las opciones cuando
    // hay llamadas anidadas a la fumcion include de EJS.
    res.render('clients/edit', {c: client});
};


// PUT /clients/:clientId
exports.update = async (req, res, next) => {

    const {body} = req;

    const clientId = req.params.clientId;

    const client = {
        name: body.name,
        company: body.company,
        department: body.department,
        website: body.website,
        description: body.description,
        city: body.city,
        country: body.country,
        password: body.password,
        mime: req.file?.mimetype,
        image: req.file?.buffer
    };


    try {
        await seda.clientUpdate(clientId, client);
        console.log('Client edited successfully.');
        res.redirect('/');
    } catch (error) {
        if (error instanceof seda.ValidationError) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));
            res.render('clients/edit', {client});
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

        if (!attachment) {
            res.redirect("/images/none.png");
        } else {
            res.type(attachment.mime);
            res.send(attachment.image);
        }
    } catch (error) {
        next(error);
    }
};


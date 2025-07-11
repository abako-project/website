"use strict";

const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {User, Client, Attachment}} = require('../models');

// Autoload the client with id equals to :clientId
exports.load = async (req, res, next, clientId) => {

    try {
        const client = await Client.findByPk(clientId, {
            include: [
                {model: User, as: "user"},
                {model: Attachment, as: "attachment"},
            ]
        });
        if (client) {
            req.load = {...req.load, client};
            next();
        } else {
            req.flash('error', 'There is no client with id=' + clientId + '.');
            throw createError(404, 'No exist clientId=' + clientId);
        }
    } catch (error) {
        next(error);
    }
};

exports.index = async (req, res, next) => {

    const clients = await Client.findAll({
        include: [
            {model: User, as: "user"},
            {model: Attachment, as: "attachment"},
        ]
    });

    res.render('clients/index',  {clients});
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
    const {client} = req.load;

    client.name = body.name;
    client.company = body.company;
    client.department = body.department;
    client.website = body.website;
    client.description = body.description;
    client.city = body.city;
    client.country = body.country;


    let fields_to_update = ["name", "company", "department", "website", "description", "city", "country"];

    // ¿Cambio el password?
    if (body.password) {
        console.log('Updating password');
        client.password = body.password;
        fields_to_update.push('salt');
        fields_to_update.push('password');
    }

    try {
        await client.save({fields: fields_to_update});

        console.log('Client edited successfully.');

        try {
            if (!req.file) {
                console.log('Client attachment does not change.');
                return;
            }
            // Delete old attachment.  // Repasar CASCADE
            if (client.attachment) {
                await client.attachment.destroy();
            }

            // Create the new client attachment
            const attachment = await Attachment.create({
                mime: req.file.mimetype,
                image: req.file.buffer
            });
            await client.setAttachment(attachment);
            console.log('Attachment saved successfully.');

        } catch (error) {
            console.log('Failed saving the new attachment: ' + error.message);
        } finally {
            res.redirect('/');
        }
    } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));
            res.render('clients/edit', {client});
        } else {
            next(error);
        }
    }
};




// GET /clients/:clientId/attachment
exports.attachment = (req, res, next) => {

    const {client: {attachment}} = req.load;

    if (!attachment) {
        res.redirect("/images/none.png");
    } else {
        res.type(attachment.mime);
        res.send(attachment.image);
    }
}


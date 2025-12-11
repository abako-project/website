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
        email: "admin@sitio.es",
        name: "admin",
        isAdmin: true,
        clientId: undefined,
        developerId: undefined
    };

    res.redirect(`/projects`);
};



// Desarrolladores registrados en el calendar.
exports.registeredDevelopers = async (req, res, next) => {
    try {

        const response = await seda.registeredWorkers();
        if (!response.success) {
            throw new Error("no puedo obtener los workers registrados en el calendar.");
        }
        let workers = response.response;

        console.log(">>> Ctrl.backdoor > registeredworkers");
        console.log(workers);
        console.log("-----------------------------");

        const developers = await seda.developerIndex();

        console.log(">>> Ctrl.backdoor > developers");
        console.log(developers);
        console.log("-----------------------------");

        for (let developer of developers) {
            let address = await seda.getWorkerAddress(developer.email);

            let registeredInCalendar = address && workers.includes(address);

            console.log("*", developer.email, " > ", address, " - ", registeredInCalendar ? "Registrado" : "No");

        }

        res.redirect(`/backdoor`);
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};

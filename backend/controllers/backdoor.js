"use strict";

const seda = require("../models/seda");

// Menu inicial
exports.index = async (req, res) => {
    res.render('backdoor');
};


// Desarrolladores registrados en el calendar.
exports.registeredDevelopers = async (req, res, next) => {
    try {

        const response = await seda.registeredWorkers();
        if (!response.success) {
            throw new Error("no puedo obtener los workers registrados en el calendar.");
        }
        let workers = response.response;

        require("../helpers/logs").log(workers, "workers");

        const developers = await seda.developerIndex();

        // console.log(">>> Ctrl.backdoor > developers");
        // console.log(developers);
        // console.log("-----------------------------");


        const response2 = await seda.workersAvailability();
        if (!response2.success) {
            throw new Error("no puedo obtener la disponibilidad de los workers..");
        }
        let availabilities = response2.response;

        require("../helpers/logs").log(availabilities, "availabilities");

        const info = [];

        for (let developer of developers) {
            let address = await seda.getWorkerAddress(developer.email);

            let registeredInCalendar = address && workers.includes(address);

            const hours = availabilities.find(item => item.worker === address)?.hours ?? 0;

            info.push({
                email: developer.email,
                workerAddress: address,
                registeredInCalendar,
                hours
            })
        }

        res.render(`backdoor/calendar`, {info});
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};

// login client 1
exports.loginClient1 = async (req, res) => {
    req.session.loginUser = {
        email: "c1@mock.es",
        name: "c1",
        clientId: 1,
        developerId: undefined,
        token: "aaaaaa"
    };

    res.redirect('/');
};


// login developer 1
exports.loginDeveloper1 = async (req, res) => {
    req.session.loginUser = {
        email: "d1@mock.es",
        name: "d1",
        clientId: undefined,
        developerId: 1,
        token: "aaaaaa"
    };

    res.redirect('/');
};

// Comodin.
exports.wild = async (req, res, next) => {
    try {


        res.redirect('/backdoor');
    } catch (error) {
        console.log('Error: An error has occurred: ' + error);
        next(error);
    }
};


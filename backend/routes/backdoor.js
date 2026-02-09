const express = require('express');
const router = express.Router();

const backdoorController = require('../controllers/backdoor');
const clientController = require('../controllers/client');
const developerController = require('../controllers/developer');
const projectController = require('../controllers/project');

const permissionController = require('../controllers/permission');


// Menu inicial
router.get('/',
    backdoorController.index);

// Listar todos los clientes
router.get('/clients',
    clientController.index);

// Listar todos los desarrolladores
router.get('/developers',
    developerController.index);


// Listar todos los proyectos
router.get('/projects',
    permissionController.isAuthenticated,
    projectController.index);

// Ver los developers registrados en el Calendar
router.get('/registeredDevelopers',
    backdoorController.registeredDevelopers);

if (process.env.VIRTO_MOCK) {

    // Logins
    router.post('/loginclient1',
        backdoorController.loginClient1
    );
    router.post('/logindeveloper1',
        backdoorController.loginDeveloper1
    );

}

// Comodin
router.get('/wild',
    backdoorController.wild);

module.exports = router;

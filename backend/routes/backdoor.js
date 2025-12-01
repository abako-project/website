const express = require('express');
const router = express.Router();

const backdoorController = require('../controllers/backdoor');
const clientController = require('../controllers/client');
const developerController = require('../controllers/developer');
const projectController = require('../controllers/project');
const roleController = require('../controllers/role');

const permissionController = require('../controllers/permission');


// Menu inicial
router.get('/',
    backdoorController.index);


// Login de admin/clientes/developers
router.get('/admin',
  backdoorController.adminLogin);
router.get('/client/:email/Login',
    backdoorController.clientLogin);
router.get('/developer/:email/Login',
    backdoorController.developerLogin);

// Listar todos los clientes
router.get('/clients',
    clientController.index);

// Listar todos los desarrolladores
router.get('/developers',
    developerController.index);


// Listar todos los proyectos
router.get('/projects',
    permissionController.isAuthenticated,
    permissionController.adminRequired,
    projectController.index);

// Listar todos los roles
router.get('/roles',
    permissionController.isAuthenticated,
    permissionController.adminRequired,
    roleController.index);

module.exports = router;

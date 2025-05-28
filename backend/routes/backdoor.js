const express = require('express');
const router = express.Router();

const backdoorController = require('../controllers/backdoor');
const clientController = require('../controllers/client');
const developerController = require('../controllers/developer');
const projectController = require('../controllers/project');
const roleController = require('../controllers/role');


// Menu inicial
router.get('/',
    backdoorController.index);


// Login de admin/clientes/developers
router.get('/admin',
  backdoorController.adminLogin);
router.get('/carlos',
  backdoorController.carlosLogin);
router.get('/daniela',
  backdoorController.danielaLogin);

// Listar todos los clientes
router.get('/clients',
  clientController.index);

// Listar todos los desarrolladores
router.get('/developers',
    developerController.index);


// Listar todos los proyectos
router.get('/projects',
  projectController.index);

// Listar todos los roles
router.get('/roles',
    roleController.index);

module.exports = router;

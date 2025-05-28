const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
const roleController = require('../controllers/role');


/* Autoloading */
router.param('roleId', roleController.load);


// Listar todos los roles
router.get('/',
    roleController.index);

// Mostrar formulario de creación
router.get('/new',
    roleController.new);

// Crear role
router.post('/create',
    roleController.create);

// Mostrar detalle de un role
router.get('/:roleId(\\d+)',
    roleController.show);

// Mostrar formulario de edición
router.get('/:roleId(\\d+)/edit',
    roleController.edit);

// Actualizar role
router.put('/:roleId(\\d+)',
    roleController.update);

// Eliminar role
router.delete('/:roleId(\\d+)',
    roleController.destroy);


module.exports = router;

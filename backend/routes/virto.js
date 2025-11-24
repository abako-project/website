
const express = require("express");
const router = express.Router();

// Usar virtoFake que conecta con el backend API desplegado
const virtoController = require('../services/virtoFake');

router.get('/',
    virtoController.index);

router.get('/check-registered/:userId(\\d+)',
    virtoController.checkRegistered);

router.post('/custom-register',
    virtoController.customRegister);

router.post('/custom-connect',
    virtoController.customConnect);

router.post('/sign',
    virtoController.sign);

module.exports = router;


const express = require("express");
const router = express.Router();

const virtoController = require('../services/virto');

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

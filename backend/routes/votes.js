const express = require('express');
const router = express.Router();

const votesController = require('../controllers/votes');

//Mostrar protipo de votaciones
router.get('/votations', votesController.viewVotes);

module.exports = router;
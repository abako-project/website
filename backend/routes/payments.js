const express = require('express');
const router = express.Router();

const paymentController = require('../controllers/payment');

const permissionController = require('../controllers/permission');


// Index with all the payments of the logged user.
router.get('/',
    permissionController.isAuthenticated,
    paymentController.payments);


module.exports = router;



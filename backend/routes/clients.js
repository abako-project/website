var express = require('express');
var router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {fileSize: 20 * 1024 * 1024}});

const clientController = require('../controllers/client');
const projectController = require('../controllers/project');
const permissionController = require("../controllers/permission");

/* Autoloading */
router.param('clientId', clientController.load);  // autoload :clientId

// Routes for the resource /clients

router.get('/',
    clientController.index);

router.get('/:clientId(\\d+)/profile',
    permissionController.isAuthenticated,
    permissionController.clientIsMyselfRequired,
    clientController.show);

router.get('/:clientId(\\d+)/profile/edit',
    permissionController.isAuthenticated,
    permissionController.clientIsMyselfRequired,
    clientController.edit);
router.put('/:clientId(\\d+)',
    permissionController.isAuthenticated,
    permissionController.clientIsMyselfRequired,
    upload.single('image'),
    clientController.update);

// Route to client attachment
router.get('/:clientId(\\d+)/attachment',
    clientController.attachment);


// Route to client projects
router.get('/:clientId(\\d+)/projects',
    permissionController.isAuthenticated,
    permissionController.clientIsMyselfRequired,
    projectController.index);

module.exports = router;

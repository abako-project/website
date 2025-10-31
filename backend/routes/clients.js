var express = require('express');
var router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {fileSize: 20 * 1024 * 1024}});

const clientController = require('../controllers/client');
const projectController = require('../controllers/project');

/* Autoloading */
router.param('clientId', clientController.load);  // autoload :clientId

// Routes for the resource /clients

router.get('/',
    clientController.index);

router.get('/:clientId(\\d+)/profile/edit',
    clientController.edit);
router.get('/:clientId(\\d+)/profile',
    clientController.show);
router.put('/:clientId(\\d+)',
    upload.single('image'),
    clientController.update);

// Route to client attachment
router.get('/:clientId(\\d+)/attachment', clientController.attachment);



// Route to client projects
router.get('/:clientId(\\d+)/projects', projectController.index);



module.exports = router;

var express = require('express');
var router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {fileSize: 20 * 1024 * 1024}});

const developerController = require('../controllers/developer');
const projectController = require('../controllers/project');
const milestoneController = require('../controllers/milestone');

/* Autoloading */
router.param('developerId', developerController.load);  // autoload :developerId

// Routes for the resource /developers

router.get('/',
    developerController.index);
router.get('/:developerId(\\d+)/profile/edit',
    developerController.edit);
router.get('/:developerId(\\d+)/profile',
    developerController.show);
router.put('/:developerId(\\d+)',
    upload.single('image'),
    developerController.update);

// Route to developer attachment
router.get('/:developerId(\\d+)/attachment',
    developerController.attachment);


// Route to developer projects
router.get('/:developerId(\\d+)/projects', projectController.index);


// Route to developer milestones
router.get('/:developerId(\\d+)/milestones', milestoneController.milestones);



module.exports = router;

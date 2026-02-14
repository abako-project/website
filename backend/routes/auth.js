
const express = require("express");
const router = express.Router();

const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({
    storage: storage,
    limits: {fileSize: 20 * 1024 * 1024}});

const authController = require("../controllers/auth");

// =========================================================================
//   REGISTRO
// =========================================================================

// --------- SELECCIONAR Cliente o Desarrollador
router.get('/register', authController.registerAreas);

// --------- Registrar un cliente
router.get('/register/client/new', authController.registerClientNew);
router.post('/register/client', authController.registerClientCreate);

// --------- Registrar un desarrollador
router.get('/register/developer/new', authController.registerDeveloperNew);
router.post('/register/developer',
    upload.single('image'),
    authController.registerDeveloperCreate);


// =========================================================================
//   LOGIN
// =========================================================================

// --------- SELECCIONAR Cliente o Desarrollador
router.get('/login', authController.loginAreas);

// --------- Login un cliente
router.get('/login/client/new', authController.loginClientNew);
router.post('/login/client', authController.loginClientCreate);

// --------- Login un desarrollador
router.get('/login/developer/new', authController.loginDeveloperNew);
router.post('/login/developer', authController.loginDeveloperCreate);

// =========================================================================
//   LOGOUT
// =========================================================================

router.delete('/logout', authController.logout);

module.exports = router;


const express = require("express");
const router = express.Router();

const proxyController = require('../controllers/proxy');

//-----------------------------------------------------------
router.get('/test',
    proxyController.test);

//-----------------------------------------------------------

router.post('/auth/custom-register',
    proxyController.customRegister);


router.post('/auth/custom-connect',
    proxyController.customConnect);

//-----------------------------------------------------------

// If I am here, then the requested route is not defined.
router.all('*', function(req, res, next) {

    var err = new Error('Endpoint not found');
    err.status = 404;
    next(err);
});

//-----------------------------------------------------------

// Error
router.use(function(err, req, res, next) {

    var emsg = err.message || "Proxy internal error";

    console.log(emsg);

    res.status(err.status || 500)
        .send({error: emsg})
        .end();
});

//-----------------------------------------------------------

module.exports = router;



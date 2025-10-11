var express = require('express');
var router = express.Router();

/* GET root page. */
router.get('/', function(req, res, next) {

    if (req.session.loginUser) {
        if (req.session.loginUser.clientId) {
            res.redirect('/clients/' + req.session.loginUser.clientId + '/projects/');
        } else if (req.session.loginUser.developerId) {
            res.redirect('/clients/' + req.session.loginUser.developerId + '/projects/');
        } else {
            res.redirect('/projects');
        }
    } else {
        res.redirect('/auth/login');
    }
});

module.exports = router;

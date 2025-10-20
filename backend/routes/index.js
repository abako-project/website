const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const homeRouter = require('./home');
const dashboardRouter = require('./dashboard');
const clientsRouter = require('./clients');
const developersRouter = require('./developers');
const projectsRouter = require('./projects');
const virtoRouter = require('./virto');
const rolesRouter = require('./roles');
const backdoorRouter = require('./backdoor');
const votesRouter = require('./votes');


router.use('/auth', authRouter);
router.use('/', homeRouter);
router.use('/dashboard', dashboardRouter);
router.use('/clients', clientsRouter);
router.use('/developers', developersRouter);
router.use('/projects', projectsRouter);
router.use('/roles', rolesRouter);
router.use('/virto', virtoRouter);
router.use('/backdoor', backdoorRouter);
router.use('/votes', votesRouter);

module.exports = router;

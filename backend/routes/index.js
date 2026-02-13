const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const homeRouter = require('./home');
const dashboardRouter = require('./dashboard');
const clientsRouter = require('./clients');
const developersRouter = require('./developers');
const projectsRouter = require('./projects');
const backdoorRouter = require('./backdoor');
const paymentsRouter = require('./payments');
const votesRouter = require('./votes');
const proxyRouter = require('./proxy');


router.use('/auth', authRouter);
router.use('/', homeRouter);
router.use('/dashboard', dashboardRouter);
router.use('/clients', clientsRouter);
router.use('/developers', developersRouter);
router.use('/projects', projectsRouter);
router.use('/backdoor', backdoorRouter);
router.use('/payments', paymentsRouter);
router.use('/projects', votesRouter);
router.use('/proxy', proxyRouter);

module.exports = router;

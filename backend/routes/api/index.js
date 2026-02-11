/**
 * API Route Aggregator
 *
 * Mounts all /api sub-routers. This is the single entry point for
 * the JSON API, mounted at /api in the main routes/index.js.
 *
 * Middleware applied here affects ALL /api routes:
 *   - apiResponse: adds res.success() and res.error() helpers
 *
 * Note: apiAuth middleware is NOT applied globally here because
 * some endpoints (like /api/auth/login, /api/auth/me, /api/enums)
 * must be accessible without authentication.
 */

const router = require('express').Router();
const apiResponse = require('../../middleware/apiResponse');

// Apply response helpers to all API routes
router.use(apiResponse);

// Mount sub-routers
router.use('/auth', require('./auth'));
router.use('/enums', require('./enums'));
router.use('/projects', require('./projects'));
router.use('/dashboard', require('./dashboard'));
router.use('/clients', require('./clients'));
router.use('/developers', require('./developers'));
router.use('/milestones', require('./milestones'));
router.use('/payments', require('./payments'));
router.use('/votes', require('./votes'));

module.exports = router;

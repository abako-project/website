/**
 * Auth API Routes
 *
 * JSON API endpoints for authentication.
 * These mirror the existing EJS auth controllers but return JSON
 * instead of rendering views or redirecting.
 *
 * During the coexistence period, login sets BOTH:
 *   - req.session.loginUser (so EJS pages continue to work)
 *   - Returns { user, token } as JSON (so the React SPA can store it)
 */

const router = require('express').Router();
const seda = require('../../models/seda');
const apiAuth = require('../../middleware/apiAuth');


/**
 * POST /api/auth/login
 *
 * Accepts: { email, token, role }
 *   - role: "client" or "developer"
 *   - email: the user's email address
 *   - token: the WebAuthn/authentication token
 *
 * Sets req.session.loginUser (EJS compat) and returns JSON { user, token }.
 */
router.post('/login', async (req, res, next) => {

    const { email, token, role } = req.body;

    // Validate required fields
    if (!email || !token || !role) {
        return res.status(400).json({
            error: true,
            message: 'Missing required fields: email, token, and role are required.',
            code: 'VALIDATION_ERROR'
        });
    }

    if (!['client', 'developer'].includes(role)) {
        return res.status(400).json({
            error: true,
            message: 'Invalid role. Must be "client" or "developer".',
            code: 'VALIDATION_ERROR'
        });
    }

    try {
        let user;

        if (role === 'client') {
            // Same logic as controllers/auth/client.js loginCreate
            const { id: clientId, name } = await seda.clientFindByEmail(email);

            // Store timezone offsets from query params (matching existing behavior)
            const browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
            req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
            req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

            // Set session for EJS compatibility
            req.session.loginUser = {
                email,
                name,
                clientId,
                developerId: undefined,
                token
            };

            user = { email, name, clientId, developerId: undefined };

        } else {
            // Same logic as controllers/auth/developer.js loginCreate
            const { id: developerId, name } = await seda.developerFindByEmail(email);

            // Store timezone offsets from query params (matching existing behavior)
            const browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
            req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
            req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

            // Set session for EJS compatibility
            req.session.loginUser = {
                email,
                name,
                clientId: undefined,
                developerId,
                token
            };

            user = { email, name, clientId: undefined, developerId };
        }

        // Save session before responding to ensure it is persisted
        req.session.save((err) => {
            if (err) {
                console.error('[API Auth] Session save error:', err);
                return res.status(500).json({
                    error: true,
                    message: 'Failed to establish session.',
                    code: 'INTERNAL_ERROR'
                });
            }

            res.json({ user, token });
        });

    } catch (error) {
        console.error('[API Auth] Login error:', error.message);
        res.status(401).json({
            error: true,
            message: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'AUTH_FAILED'
        });
    }
});


/**
 * POST /api/auth/register
 *
 * Accepts: { email, name, role, preparedData }
 *   - role: "client" or "developer"
 *   - email: the user's email address
 *   - name: the user's display name
 *   - preparedData: WebAuthn registration data from sdk.auth.prepareRegistration()
 *
 * Mirrors the EJS controllers at controllers/auth/client.js and developer.js (registerCreate).
 */
router.post('/register', async (req, res) => {

    const { email, name, role, preparedData } = req.body;

    // Validate required fields
    if (!email || !name || !role || !preparedData) {
        return res.status(400).json({
            error: true,
            message: 'Missing required fields: email, name, role, and preparedData are required.',
            code: 'VALIDATION_ERROR'
        });
    }

    if (!['client', 'developer'].includes(role)) {
        return res.status(400).json({
            error: true,
            message: 'Invalid role. Must be "client" or "developer".',
            code: 'VALIDATION_ERROR'
        });
    }

    try {
        if (role === 'client') {
            await seda.clientCreate(email, name, preparedData);
        } else {
            await seda.developerCreate(email, name, preparedData);
        }

        res.json({
            success: true,
            message: `${role === 'client' ? 'Client' : 'Developer'} registered successfully.`
        });

    } catch (error) {
        console.error('[API Auth] Registration error:', error.message);
        res.status(400).json({
            error: true,
            message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            code: 'REGISTRATION_FAILED'
        });
    }
});


/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user from the session.
 * Returns 401 if not authenticated.
 */
router.get('/me', (req, res) => {

    if (!req.session || !req.session.loginUser) {
        return res.status(401).json({
            error: true,
            message: 'Not authenticated.',
            code: 'AUTH_REQUIRED'
        });
    }

    const loginUser = req.session.loginUser;

    res.json({
        user: {
            email: loginUser.email,
            name: loginUser.name,
            clientId: loginUser.clientId,
            developerId: loginUser.developerId
        }
    });
});


/**
 * DELETE /api/auth/logout
 *
 * Clears the session (removes loginUser).
 * Works for both EJS and React SPA sessions.
 */
router.delete('/logout', (req, res) => {

    // Remove loginUser from session (same as controllers/auth/index.js logout)
    delete req.session.loginUser;

    // Also clear scope draft if present
    delete req.session.scope;

    req.session.save((err) => {
        if (err) {
            console.error('[API Auth] Session save error on logout:', err);
            return res.status(500).json({
                error: true,
                message: 'Failed to clear session.',
                code: 'INTERNAL_ERROR'
            });
        }

        res.json({ success: true });
    });
});


module.exports = router;

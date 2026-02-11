/**
 * API Authentication Middleware (Dual-Auth)
 *
 * Supports two authentication methods for the coexistence period:
 *   1. Express session (EJS) - checks req.session.loginUser
 *   2. Bearer token header (React SPA) - checks Authorization header
 *
 * Normalizes the authenticated user to req.user for downstream handlers.
 * Returns 401 JSON if neither authentication method succeeds.
 */

module.exports = (req, res, next) => {

    // Method 1: Check Bearer token header (React SPA)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);

        // The Bearer token alone does not carry user identity.
        // During the coexistence period, the React SPA logs in via
        // POST /api/auth/login which sets BOTH the session and returns
        // the token. So a valid Bearer token should always have a
        // corresponding session. If the session expired but the React
        // app still holds the token, we must reject.
        if (req.session && req.session.loginUser) {
            req.user = {
                email: req.session.loginUser.email,
                name: req.session.loginUser.name,
                clientId: req.session.loginUser.clientId,
                developerId: req.session.loginUser.developerId,
                token: token
            };
            return next();
        }

        // Token present but session expired
        return res.status(401).json({
            error: true,
            message: 'Session expired. Please log in again.',
            code: 'SESSION_EXPIRED'
        });
    }

    // Method 2: Check Express session (EJS pages, or React on same origin)
    if (req.session && req.session.loginUser) {
        req.user = {
            email: req.session.loginUser.email,
            name: req.session.loginUser.name,
            clientId: req.session.loginUser.clientId,
            developerId: req.session.loginUser.developerId,
            token: req.session.loginUser.token
        };
        return next();
    }

    // Neither method succeeded
    return res.status(401).json({
        error: true,
        message: 'Authentication required.',
        code: 'AUTH_REQUIRED'
    });
};

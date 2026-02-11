/**
 * API Error Handler Middleware
 *
 * Express error-handling middleware for /api routes.
 * Returns structured JSON error responses instead of rendering EJS error pages.
 *
 * Must be mounted BEFORE the EJS error handler in app.js so that
 * /api errors are caught here and non-API errors fall through.
 */

module.exports = (err, req, res, next) => {

    // Only handle errors for /api routes
    if (!req.path.startsWith('/api/')) {
        return next(err);
    }

    // Determine HTTP status code
    let statusCode = err.statusCode || err.status || 500;

    // Map common error types to status codes
    if (err.message && statusCode === 500) {
        const msg = err.message.toLowerCase();
        if (msg.includes('not found')) {
            statusCode = 404;
        } else if (msg.includes('validation') || msg.includes('invalid') || msg.includes('required')) {
            statusCode = 400;
        } else if (msg.includes('unauthorized') || msg.includes('authentication')) {
            statusCode = 401;
        } else if (msg.includes('forbidden') || msg.includes('prohibited') || msg.includes('permission')) {
            statusCode = 403;
        }
    }

    // Build the error response
    const errorResponse = {
        error: true,
        message: err.message || 'Internal server error',
        code: err.code || httpStatusToCode(statusCode)
    };

    // Include stack trace in development only
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = err.stack;
    }

    // Include validation details if available
    if (err.details) {
        errorResponse.details = err.details;
    }

    // Log server errors
    if (statusCode >= 500) {
        console.error(`[API Error] ${statusCode} ${req.method} ${req.path}:`, err.message);
        if (process.env.NODE_ENV === 'development') {
            console.error(err.stack);
        }
    }

    res.status(statusCode).json(errorResponse);
};


/**
 * Maps HTTP status codes to machine-readable error codes.
 */
function httpStatusToCode(statusCode) {
    const codeMap = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        409: 'CONFLICT',
        422: 'UNPROCESSABLE_ENTITY',
        429: 'TOO_MANY_REQUESTS',
        500: 'INTERNAL_ERROR'
    };
    return codeMap[statusCode] || 'INTERNAL_ERROR';
}

/**
 * API Response Helper Middleware
 *
 * Attaches convenience methods to the Express response object:
 *   - res.success(data, statusCode) - Send a successful JSON response
 *   - res.error(message, statusCode, code) - Send an error JSON response
 *
 * This ensures consistent response shapes across all API endpoints.
 */

module.exports = (req, res, next) => {

    /**
     * Send a successful JSON response.
     *
     * @param {*} data - The response payload (object, array, or primitive)
     * @param {number} [statusCode=200] - HTTP status code
     */
    res.success = (data, statusCode = 200) => {
        res.status(statusCode).json(data);
    };

    /**
     * Send an error JSON response.
     *
     * @param {string} message - Human-readable error message
     * @param {number} [statusCode=400] - HTTP status code
     * @param {string} [code] - Machine-readable error code
     */
    res.error = (message, statusCode = 400, code) => {
        res.status(statusCode).json({
            error: true,
            message: message,
            code: code || httpStatusToCode(statusCode)
        });
    };

    next();
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
        500: 'INTERNAL_ERROR'
    };
    return codeMap[statusCode] || 'INTERNAL_ERROR';
}

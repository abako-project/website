
const {adapterAPI} = require('../adapter');

//-----------------------------------------------------------

/**
 * Register a new Developer.
 *
 * @async
 * @function developerCreate
 * @param {string} email - Email del desarrollador.
 * @param {string} name - Nombre del desarrollador.
 * @throws {Error} Si falta algún parámetro obligatorio.
 */
exports.developerCreate = async (email, name, githubUsername, portfolioUrl, image) => {

    if (!email) {
        throw new Error('The email field is required to register a developer.');
    }

    if (!name) {
        throw new Error('The name field is required to register a developer.');
    }

    try {
        console.log('[SEDA Developer] Completing developer profile');
        const response2 = await adapterAPI.createDeveloper(email, name, githubUsername, portfolioUrl, image);
        console.log('[SEDA Developer] Developer profile completed:', response2);
        return response2;
    } catch (error) {
        console.error('[SEDA Developer] Error creating developer:', error);
        throw error;
    }

}

//-----------------------------------------------------------

/**
 * Register a new client.
 *
 * @async
 * @function clientCreate
 * @param {string} email - Email del cliente.
 * @param {string} name - Nombre del cliente.
 * @throws {Error} Si el email o el password no están definidos.
 */
exports.clientCreate = async (email, name) => {

    if (!email) {
        throw new Error('The email field is required to register a client.');
    }

    if (!name) {
        throw new Error('The name field is required to register a client.');
    }

    try {
        console.log('[SEDA Client] Step 2: Completing client profile');
        const response2 = await adapterAPI.createClient(email, name);
        console.log('[SEDA Client] Client profile completed:', response2);
    } catch (error) {
        console.error('[SEDA Client] Error creating client:', error);
        throw error;
    }
}

//-----------------------------------------------------------

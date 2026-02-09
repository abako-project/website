

const {adapterAPI} = require("../adapter");


//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los clientes registrados,
 * incluyendo sus datos de usuario y adjuntos.
 *
 * @async
 * @function clientIndex
 * @returns {Promise<Object[]>} Lista de clientes en formato JSON.
 */
exports.clientIndex = async () => {

    const {clients} = await adapterAPI.getClients();

    clients.forEach(client => {
        exports.cleanClient(client);
    });

    return clients;
}

//-----------------------------------------------------------

/**
 * Devuelve los datos de un cliente por su ID,
 * incluyendo su información de usuario y adjunto.
 *
 * @async
 * @function client
 * @param {number} clientId - ID del cliente.
 * @returns {Promise<Object>} Objeto JSON con los datos del cliente.
 * @throws {Error} Si no se encuentra el cliente.
 */
exports.client = async clientId => {

    const {client} = await adapterAPI.getClient(clientId);

    // require("../../helpers/logs").log(client,"Seda Client ANTES");

    exports.cleanClient(client);


    return client;
};

// Eliminar las propiedades que no me interesan:
exports.cleanClient = async client => {

    delete client._id;
    delete client.__v;
    delete client.imageData;
    delete client.imageMimeType;
    delete client.projects;
    delete client.createdAt;
    delete client.updatedAt;
};

//-----------------------------------------------------------

/**
 * Actualiza los datos de un cliente.
 * Si se incluye una nueva imagen, se reemplaza el adjunto anterior.
 *
 * @async
 * @function clientUpdate
 * @param {number} clientId - ID del cliente a actualizar.
 * @param {Object} data - Datos a actualizar.
 * @param {string} [data.name]
 * @param {string} [data.company]
 * @param {string} [data.department]
 * @param {string} [data.website]
 * @param {string} [data.description]
 * @param {string} [data.location]
 * @param {number[]} [data.languageIds]
 * @param {string} [data.mime] - Tipo MIME de la nueva imagen (opcional).
 * @param {string} [data.image] - Imagen codificada en base64 (opcional).
 * @throws {Error} Si ocurre un error en la actualización.
 */
exports.clientUpdate = async (clientId, data, image) => {
    try {
        const response = await adapterAPI.updateClient(clientId, data, image);
        return response;
    } catch (error) {
        console.error('[SEDA Client] Error updating client:', error);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Busca un cliente por su dirección de email.
 *
 * @async
 * @function clientFindByEmail
 * @param {string} email - Dirección de correo electrónico del cliente.
 * @returns {Promise<Object|null>} Objeto JSON con los datos del cliente, o `null` si no existe.
 */
exports.clientFindByEmail = async (email) => {

    return await adapterAPI.findClientByEmail(email);
}

//-----------------------------------------------------------

/**
 * Devuelve el attachment asociado a un cliente.
 *
 * @async
 * @function clientAttachment
 * @param {number} clientId - ID del cliente.
 * @returns {Promise<Object|null>} Objeto JSON con los datos del attachment, o `null` si no existe.
 */
exports.clientAttachment = async clientId => {
    try {
        return await adapterAPI.getClientAttachment(clientId);
    } catch (error) {
        console.error('[SEDA Client Attachment] Error:', error);
        return null;
    }
};

//-----------------------------------------------------------


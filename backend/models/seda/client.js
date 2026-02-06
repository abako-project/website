

const {adapterAPI} = require("../adapter");


//-----------------------------------------------------------

exports.clientConnect = async (email) => {

    try {
        if (!email) {
            throw new Error('El campo email es obligatorio para loguear un cliente.');
        }

        if (!preparedData) {
            throw new Error('El campo preparedData es obligatorio para loguear un cliente.');
        }

        console.log('[SEDA Client Connect] Step 1: customConnect');

        const response = await adapterAPI.customConnect({userId: email});

        console.log('[SEDA Client Connect] Step 1: customConnect', response);

        if (response.success) {
            console.log('[SEDA Client] customConnect is successfull.');
        } else {
            console.log('[SEDA Client] customConnect has failed:', response.error);
            throw new Error(response.error);
        }

        console.log('[SEDA Client Connect] Step 2: Obtener nombre');

        const client = await adapterAPI.findClientByEmail(email);
        //const client = (await adapterAPI.getClients()).clients.find(d => d.email === email);

        console.log('[SEDA Client Connect] Step 3: Fin');

        return {
            clientId: client?.id,
            token: response.token,
            name: client.name
        };
    } catch (error) {
        console.error('[SEDA Client] Error connecting developer:', error);
        throw error;
    }
};

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

    exports.cleanClient(client);

   // require("../../helpers/logs").log(client,"Seda Client");

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
 * Crea un nuevo cliente con un usuario asociado.
 *
 * @async
 * @function clientCreate
 * @param {string} email - Email del cliente.
 * @param {string} name - Nombre del cliente.
 * @param {object} preparedData - Datos para registar a un usuario en Virto.
 * @throws {Error} Si el email o el password no están definidos.
 */
exports.clientCreate = async (email, name, preparedData) => {

    if (!email) {
        throw new Error('El campo email es obligatorio para crear un cliente.');
    }

    if (!name) {
        throw new Error('El campo name es obligatorio para registrar un cliente.');
    }

    if (!preparedData) {
        throw new Error('El campo preparedData es obligatorio para registrar un cliente.');
    }

    try {
        // ------ PASO 1: Crear la cuenta base con /adapter/v1/custom-register

        console.log('[SEDA Client] Step 1: Creating account with custom-register');

        const response = await adapterAPI.customRegister(preparedData);

        if (response.success) {
            console.log('[SEDA Client] Account creation is successfull:', response.message);
        } else {
            console.log('[SEDA Client] Account creation has failed:', response.error);
            throw new Error(response.error);
        }

        // ------ PASO 2: Completar el perfil de cliente con /adapter/v1/clients

        console.log('[SEDA Client] Step 2: Completing client profile');

        const response2 = await adapterAPI.createClient(email, name);


        console.log('[SEDA Client] Client profile completed:', response2);

    } catch (error) {
        console.error('[SEDA Client] Error creating client:', error);
        throw error;
    }
}

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


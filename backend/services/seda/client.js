

const json = require("./json");
const { adapterAPI } = require('../api-client');

// Keep Sequelize models for backward compatibility and non-API operations
const {
  models: {
    Client, User, Language, Attachment
  }
} = require('../../models');


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
  try {
    const clients = await adapterAPI.getClients();
    return clients;
  } catch (error) {
    console.error('[SEDA Client] Error fetching clients:', error);
    throw error;
  }
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
  try {
    const client = await adapterAPI.getClient(clientId);
    return client;
  } catch (error) {
    console.error(`[SEDA Client] Error fetching client ${clientId}:`, error);
    throw new Error('There is no client with id=' + clientId);
  }
};

//-----------------------------------------------------------

/**
 * Crea un nuevo cliente con un usuario asociado.
 *
 * @async
 * @function clientCreate
 * @param {string} email - Email del cliente.
 * @param {string} password - Contraseña del cliente.
 * @returns {Promise<Object>} Objeto JSON con los datos del cliente creado.
 * @throws {Error} Si el email o el password no están definidos.
 */
exports.clientCreate = async (email, password) => {
  if (!email) {
    throw new Error('El campo email es obligatorio para crear un cliente.');
  }

  if (!password) {
    throw new Error('El campo password es obligatorio para crear un cliente.');
  }

  try {
    const client = await adapterAPI.createClient({ email, password });
    return client;
  } catch (error) {
    console.error('[SEDA Client] Error creating client:', error);
    throw error;
  }
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
 * @param {string} [data.password] - Nuevo password (opcional).
 * @param {string} [data.mime] - Tipo MIME de la nueva imagen (opcional).
 * @param {string} [data.image] - Imagen codificada en base64 (opcional).
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados del cliente.
 * @throws {Error} Si ocurre un error en la actualización.
 */
exports.clientUpdate = async (clientId, {
  name, company, department, website, description, location, password, languageIds,
  mime, image
}) => {

  // ¿Cambio el password?
  if (password) {
    await Client.update({
      name, company, department, website, description, location, password
    }, {
      where: {id: clientId}
    });
  } else {
    await Client.update({
      name, company, department, website, description, location
    }, {
      where: {id: clientId}
    });
  }

  const client = await Client.findByPk(clientId);

  await client.setLanguages(languageIds);

  // Hay un attachment nuevo
  if (mime && image) {
    // Delete old attachment.
    await Attachment.destroy({where: {clientId}});

    // Create the new client attachment
    const attachment = await Attachment.create({mime, image});
    await client.setAttachment(attachment);
  }

  return json.clientJson(client);
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
  try {
    const client = await adapterAPI.findClientByEmail(email);
    return client;
  } catch (error) {
    console.error(`[SEDA Client] Error finding client by email ${email}:`, error);
    return null;
  }
}


//-----------------------------------------------------------

/**
 * Busca un cliente por email y verifica su contraseña.
 *
 * @async
 * @function clientFindByEmailPassword
 * @param {string} email - Dirección de correo electrónico del cliente.
 * @param {string} password - Contraseña proporcionada por el cliente.
 * @returns {Promise<Object|null>} Objeto JSON del cliente si las credenciales son correctas, o `null`.
 */
exports.clientFindByEmailPassword = async (email, password) => {
  try {
    const client = await adapterAPI.findClientByEmailPassword(email, password);
    return client;
  } catch (error) {
    console.error(`[SEDA Client] Error authenticating client ${email}:`, error);
    return null;
  }
};

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

  const client = await Client.findByPk(clientId, {
    include: [
      {model: Attachment, as: "attachment"},
    ]
  })

  if (client?.attachment) {
    return json.attachmentJson(client.attachment);
  } else {
    return null;
  }
};

//-----------------------------------------------------------


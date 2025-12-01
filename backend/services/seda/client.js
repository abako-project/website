

const json = require("./json");

const {
  models: {
    Client, User, Language, Attachment
  }
} = require('../../models');
const {adapterAPI} = require("../api-client");


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

    const response = await adapterAPI.getClients();

    return response.clients;

    /*
  const clients = await Client.findAll({
    include: [
      {model: User, as: "user"},
      {model: Attachment, as: "attachment"},
      {model: Language, as: "languages"},
    ]
  });

  return clients.map(client => json.clientJson(client));

     */
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

  const client = await Client.findByPk(clientId, {
    include: [
      {model: User, as: "user"},
      {model: Attachment, as: "attachment"},
      {model: Language, as: "languages"},
    ]
  });
  if (client) {
    return json.clientJson(client);
  } else {
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

  let client = await Client.findByPk(clientId, {
    include: [{ model: Attachment, as: "attachment" }]
  });

  await client.setLanguages(languageIds);

  // Hay un attachment nuevo
  if (mime && image && image.length > 0) {

    if (client.attachment) {
      await client.update({ attachmentId: null });
      await Attachment.destroy({ where: { id: client.attachment.id } });
    }

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

  const client = await Client.findOne({
    include: [
      {
        model: User, as: "user",
        where: {email}
      }
    ]
  });

  return client ? json.clientJson(client) : null;
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

  const client = await Client.findOne({
    include: [
      {
        model: User, as: "user",
        where: {email}
      }
    ]
  });

  if (!client) {
    return null;
  }

  const valid = await client.verifyPassword(password);

  if (!valid) {
    return null;
  }

  return json.clientJson(client);
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




const json = require("./json");

const {
  models: {
    Project, Client, Developer, User, Attachment,
    Objective, Constraint, Milestone, Task, Role, Comment, Assignation
  }
} = require('../../models');


//-----------------------------------------------------------

// Devuelve un listado de todos los clientes registrados.
exports.clientIndex = async () => {

  const clients = await Client.findAll({
    include: [
      {model: User, as: "user"},
      {model: Attachment, as: "attachment"},
    ]
  });

  return clients.map(client => json.clientJson(client));
}

//-----------------------------------------------------------

// Devuelve los datos de un cliente.
// Tambien incluye sus datos como usuario.
// Parametros:
//   * clientId: id del cliente
// Devuelve: un JSON con los datos del cliente,
exports.client = async clientId => {

  const client = await Client.findByPk(clientId, {
    include: [
      {model: User, as: "user"},
      {model: Attachment, as: "attachment"},
    ]
  });
  if (client) {
    return json.clientJson(client);
  } else {
    throw new Error('There is no client with id=' + clientId);
  }
};

//-----------------------------------------------------------

// Registrar un cliente nuevo.
// Parametros:
//    email:    email del cliente.
//    password: password del cliente.
// Devuelve un JSON con los datos del cliente creado.
exports.clientCreate = async (email, password) => {

  if (!email) {
    throw new Error('El campo email es obligatorio para crear un cliente.');
  }

  if (!password) {
    throw new Error('El campo password es obligatorio para crear un cliente.');
  }

  const user = await User.create({email});
  const client = await Client.create({password});
  await user.setClient(client);

  return json.clientJson(client);
}

//-----------------------------------------------------------

// Actualiza los datos de un cliente.
// Parametros:
//    clientId: id del cliente.
//    otros: nuevos valores para actualizar el cliente.
//      NOTA: El valor del password se puede dejar vacio para no cambiar su valor.
// Devuelve un JSON con los datos actializados del cliente.
exports.clientUpdate = async (clientId, {
  name, company, department, website, description, city, country, password,
  mime, image
}) => {

  // ¿Cambio el password?
  if (password) {
    await Client.update({
      name, company, department, website, description, city, country, password
    }, {
      where: {id: clientId}
    });
  } else {
    await Client.update({
      name, company, department, website, description, city, country
    }, {
      where: {id: clientId}
    });
  }

  const client = await Client.findByPk(clientId);

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

// Busca un cliente por su email.
// Parametros:
//    email:    email del cliente.
// Devuelve un JSON con los datos del cliente encontrado, o null si no existe.
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

// Busca un cliente por su email and password.
// Parametros:
//    email:    email del cliente.
//    password: password del cliente.
// Devuelve un JSON con los datos del cliente encontrado, o null si no existe.
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

// Devuelve el attachment de un cliente.
// Parametros:
//   * clientId: id del cliente
// Devuelve: un JSON con los datos del attachment,
exports.clientAttachment = async clientId => {

  const attachment = await Attachment.findOne({
    where: {clientId}
  })

  if (attachment) {
    return json.attachmentJson(attachment);
  } else {
    return null;
  }
};

//-----------------------------------------------------------


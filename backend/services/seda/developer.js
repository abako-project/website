const {Sequelize, Op} = require("sequelize");

const json = require("./json");

const {
  models: {
    Project, Client, Developer, User, Attachment, Language, Skill,
    Objective, Constraint, Milestone, Task, Role, Comment, Assignation
  }
} = require('../../models');

//-----------------------------------------------------------

// Devuelve un listado de todos los developers registrados.
exports.developerIndex = async () => {

  const developers = await Developer.findAll({
    include: [
      {model: User, as: "user"},
      {model: Attachment, as: "attachment"},
      {model: Language, as: "languages"},
      {model: Role, as: "role"},
      {model: Skill, as: "skills"},
    ]
  });

  return developers.map(developer => json.developerJson(developer));
}

//-----------------------------------------------------------


// Devuelve los datos de un developer.
// Tambien incluye sus datos como usuario, lengiajes y skills.
// Parametros:
//   * developerId: id del desarrollador
// Devuelve: un JSON con los datos del desarrollador,
exports.developer = async developerId => {

  const developer = await Developer.findByPk(developerId, {
    include: [
      {model: User, as: "user"},
      {model: Attachment, as: "attachment"},
      {model: Language, as: "languages"},
      {model: Skill, as: "skills"},
    ]
  });
  if (developer) {
    return json.developerJson(developer);
  } else {
    throw new Error('There is no developer with id=' + developerId);
  }
};

//-----------------------------------------------------------

// Registrar un developer nuevo.
// Parametros:
//    email:   email del developer.
//    name:    nombre del developer.
//    address: address del developer en la blockchain.
// Devuelve un JSON con los datos del developer creado.
exports.developerCreate = async (email, name, address) => {

  if (!email) {
    throw new Error('El campo email es obligatorio para registrar un cliente.');
  }

  if (!name) {
    throw new Error('El campo name es obligatorio para registrar un developer.');
  }

  if (!address) {
    throw new Error('El campo address es obligatorio para registrar un developer.');
  }

  const user = await User.create({email});
  const developer = await Developer.create({email, name, address});
  await user.setDeveloper(developer);

  return json.developerJson(developer);
}

//-----------------------------------------------------------

// Actualiza los datos de un developer.
// Parametros:
//    developerId: id del developer.
//    otros: nuevos valores para actualizar el developer.
// Devuelve un JSON con los datos actializados del developer.
exports.developerUpdate = async (developerId, {
  name, bio, background, roleId, experienceLevel, githubUsername, portfolioUrl, city, country, availability,
  languageIds, skillIds,
  mime, image
}) => {

  await Developer.update({
      developerId,
      name, bio, background, roleId, experienceLevel, githubUsername, portfolioUrl, city, country, availability
    }, {
      where: {
        id: developerId
      }
    }
  );

  let developer = await Developer.findByPk(developerId);

  await developer.setLanguages(languageIds);
  await developer.setSkills(skillIds);

  // Hay un attachment nuevo
  if (mime && image) {
    // Delete old attachment.
    await Attachment.destroy({where: {developerId}});

    // Create the new developer attachment
    const attachment = await Attachment.create({mime, image});
    await developer.setAttachment(attachment);
  }

  return json.developerJson(developer);
};

//-----------------------------------------------------------

// Busca un developer por su email.
// Parametros:
//    email:    email del cliente.
// Devuelve un JSON con los datos del developer encontrado, o null si no existe.
exports.developerFindByEmail = async (email) => {

  const developer = await Developer.findOne({
    include: [
      {
        model: User, as: "user",
        where: {email}
      }
    ]
  });

  return developer ? json.developerJson(developer) : null;
}

//-----------------------------------------------------------

// Busca los developers de un role.
// Parametros:
//    roleId:    id del role a buscar.
// Devuelve un JSON con los developer que tienen el role dado.
exports.developersWithRole = async (roleId) => {

  const developers = await Developer.findAll({
    where: {roleId}
  });

  return developers.map(developer => json.developerJson(developer));
}

//-----------------------------------------------------------

// Devuelve el attachment de un developer.
// Parametros:
//    developerId: id del developer.
// Devuelve: un JSON con los datos del developer,
exports.developerAttachment = async developerId => {

  const attachment = await Attachment.findOne({
    where: {developerId}
  })

  if (attachment) {
    return json.attachmentJson(attachment);
  } else {
    return null;
  }
};

//-----------------------------------------------------------


const {Sequelize, Op} = require("sequelize");

const json = require("./json");

const {
  models: {
    Developer, User, Attachment, Language, Skill, Role, Proficiency
  }
} = require('../../models');

//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los desarrolladores registrados,
 * incluyendo su información de usuario, adjunto, lenguajes, rol y habilidades.
 *
 * @async
 * @function developerIndex
 * @returns {Promise<Object[]>} Lista de desarrolladores en formato JSON.
 */
exports.developerIndex = async () => {

  const developers = await Developer.findAll({
    include: [
      {model: User, as: "user"},
      {model: Attachment, as: "attachment"},
      {model: Language, as: "languages"},
      {model: Role, as: "role"},
      {model: Proficiency, as: "proficiency"},
      {model: Skill, as: "skills"},
    ]
  });

  return developers.map(developer => json.developerJson(developer));
}

//-----------------------------------------------------------

/**
 * Devuelve los datos de un desarrollador por su ID,
 * incluyendo información de usuario, lenguajes y habilidades.
 *
 * @async
 * @function developer
 * @param {number} developerId - ID del desarrollador.
 * @returns {Promise<Object>} Objeto JSON con los datos del desarrollador.
 * @throws {Error} Si no se encuentra el desarrollador.
 */
exports.developer = async developerId => {

  const developer = await Developer.findByPk(developerId, {
    include: [
      {model: User, as: "user"},
      {model: Attachment, as: "attachment"},
      {model: Language, as: "languages"},
      {model: Role, as: "role"},
      {model: Proficiency, as: "proficiency"},
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

/**
 * Registra un nuevo desarrollador y crea el usuario asociado.
 *
 * @async
 * @function developerCreate
 * @param {string} email - Email del desarrollador.
 * @param {string} name - Nombre del desarrollador.
 * @param {string} address - Dirección del desarrollador en la blockchain.
 * @returns {Promise<Object>} Objeto JSON con los datos del desarrollador creado.
 * @throws {Error} Si falta algún parámetro obligatorio.
 */
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

/**
 * Actualiza los datos de un desarrollador, incluyendo habilidades, lenguajes y adjunto.
 *
 * @async
 * @function developerUpdate
 * @param {number} developerId - ID del desarrollador a actualizar.
 * @param {Object} data - Datos a actualizar.
 * @param {string} [data.name]
 * @param {string} [data.bio]
 * @param {string} [data.background]
 * @param {number} [data.roleId]
 * @param {number} [data.proficiencyId]
 * @param {string} [data.githubUsername]
 * @param {string} [data.portfolioUrl]
 * @param {string} [data.location]
 * @param {string} [data.availability]
 * @param {number[]} [data.languageIds]
 * @param {number[]} [data.skillIds]
 * @param {string} [data.mime] - Tipo MIME del nuevo adjunto.
 * @param {string} [data.image] - Imagen codificada en base64.
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados del desarrollador.
 */
exports.developerUpdate = async (developerId, {
  name, bio, background, roleId, proficiencyId, githubUsername, portfolioUrl, location, availability,
  languageIds, skillIds,
  mime, image
}) => {

  await Developer.update({
      developerId,
      name, bio, background, roleId, proficiencyId, githubUsername, portfolioUrl, location, availability
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

/**
 * Busca un desarrollador por su dirección de email.
 *
 * @async
 * @function developerFindByEmail
 * @param {string} email - Dirección de correo del desarrollador.
 * @returns {Promise<Object|null>} Objeto JSON con los datos del desarrollador, o `null` si no existe.
 */
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

/**
 * Busca todos los desarrolladores que tienen asignado un rol específico.
 *
 * @async
 * @function developersWithRole
 * @param {number} roleId - ID del rol.
 * @returns {Promise<Object[]>} Lista de desarrolladores con el rol especificado.
 */
exports.developersWithRole = async (roleId) => {

  const developers = await Developer.findAll({
  //  where: {roleId}
  });

  return developers.map(developer => json.developerJson(developer));
}

//-----------------------------------------------------------

/**
 * Devuelve el adjunto (attachment) de un desarrollador.
 *
 * @async
 * @function developerAttachment
 * @param {number} developerId - ID del desarrollador.
 * @returns {Promise<Object|null>} Objeto JSON con el attachment o `null` si no existe.
 */
exports.developerAttachment = async developerId => {

  const developer = await Developer.findByPk(developerId, {
    include: [
      {model: Attachment, as: "attachment"},
    ]
  })

  if (developer?.attachment) {
    return json.attachmentJson(developer.attachment);
  } else {
    return null;
  }
};

//-----------------------------------------------------------


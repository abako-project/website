
const json = require("./json");
const { adapterAPI } = require('../api-client');

// Keep Sequelize models for backward compatibility
const {
  models: {
    Developer, User, Attachment, Language, Skill, Role, Proficiency, Project, Milestone
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
  try {
    const developers = await adapterAPI.getDevelopers();
    return developers;
  } catch (error) {
    console.error('[SEDA Developer] Error fetching developers:', error);
    throw error;
  }
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
  try {
    const developer = await adapterAPI.getDeveloper(developerId);
    return developer;
  } catch (error) {
    console.error(`[SEDA Developer] Error fetching developer ${developerId}:`, error);
    throw new Error('There is no developer with id=' + developerId);
  }
};
//-----------------------------------------------------------

/**
 * Devuelve todos los developers asignados a un proyecto,
 * a través de sus milestones.
 *
 * @async
 * @function projectDevelopers
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<Object[]>} Lista de developers únicos asociados al proyecto.
 * @throws {Error} Si no existe el proyecto.
 */

exports.developers = async projectId => {
  const project = await Project.findByPk(projectId, {
    include: [
      {
        model: Milestone,
        as: 'milestones',
        include: [
          {
            model: Developer,
            as: 'developer',
            include: [
              { model: User, as: "user" },
              {model: Language, as: "languages"},
              { model: Attachment, as: "attachment"},
              { model: Role, as: "role" },
              { model: Proficiency, as: "proficiency" },
              {model: Skill, as: "skills"},
            ]
          }
        ]
      }
    ]
  });

  if (!project) throw new Error('There is no project with id=' + projectId);

  const developers = project.milestones
    .map(m => m.developer)
    .filter(Boolean)
    .reduce((acc, dev) => {
      if (!acc.find(d => d.id === dev.id)) acc.push(dev);
      return acc;
    }, []);

  return developers.map(d => json.developerJson(d));
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

  try {
    console.log('[SEDA Developer] Step 1: Creating account with custom-register');
    
    // PASO 1: Crear la cuenta base con /adapter/v1/custom-register
    const accountData = { email, name, address };
    const account = await adapterAPI.customRegister(accountData);
    
    console.log('[SEDA Developer] Account created:', { id: account.id, email: account.email });
    console.log('[SEDA Developer] Step 2: Completing developer profile');
    
    // PASO 2: Completar el perfil de developer con /adapter/v1/developers
    const developerData = { 
      email, 
      name, 
      address
    };
    
    const developer = await adapterAPI.createDeveloper(developerData);
    console.log('[SEDA Developer] Developer profile completed:', { id: developer.id });
    
    return developer;
  } catch (error) {
    console.error('[SEDA Developer] Error creating developer:', error);
    throw error;
  }
};

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
 * @param {boolean} [data.isAvailableForHire]
 * @param {boolean} [data.isAvailableFullTime]
 * @param {boolean} [data.isAvailablePartTime]
 * @param {boolean} [data.isAvailableHourly]
 * @param {number} [data.availableHoursPerWeek]
 * @param {number[]} [data.languageIds]
 * @param {number[]} [data.skillIds]
 * @param {string} [data.mime] - Tipo MIME del nuevo adjunto.
 * @param {string} [data.image] - Imagen codificada en base64.
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados del desarrollador.
 */
exports.developerUpdate = async (developerId, {
  name, bio, background, roleId, proficiencyId, githubUsername, portfolioUrl, location,
  languageIds, skillIds,
  isAvailableForHire, isAvailableFullTime, isAvailablePartTime, isAvailableHourly, availableHoursPerWeek,
  mime, image
}) => {

  await Developer.update({
      developerId,
      name, bio, background, roleId, proficiencyId, githubUsername, portfolioUrl, location,
      isAvailableForHire, isAvailableFullTime, isAvailablePartTime, isAvailableHourly, availableHoursPerWeek
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
  try {
    const developer = await adapterAPI.findDeveloperByEmail(email);
    return developer;
  } catch (error) {
    console.error(`[SEDA Developer] Error finding developer by email ${email}:`, error);
    return null;
  }
};

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


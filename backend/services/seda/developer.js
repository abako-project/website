const json = require("./json");

const {adapterAPI} = require('../api-client');

// Keep Sequelize models for backward compatibility
const {
    models: {
        Developer, User, Attachment, Language, Skill, Role, Proficiency, Project, Milestone
    }
} = require('../../models');

//-----------------------------------------------------------

exports.developerConnect = async (email) => {

    try {
        if (!email) {
            throw new Error('El campo email es obligatorio para loguear un developer.');
        }

        if (!preparedData) {
            throw new Error('El campo preparedData es obligatorio para loguear un developer.');
        }

        console.log('[SEDA Developer Connect] Step 1: customConnect');

        const response = await adapterAPI.customConnect({userId: email});

        console.log('[SEDA Developer Connect] Step 1: customConnect', response);

        if (response.success) {
            console.log('[SEDA Developer] customConnect is successfull.');
        } else {
            console.log('[SEDA Developer] customConnect has failed:', response.error);
            throw new Error(response.error);
        }

        console.log('[SEDA Developer Connect] Step 2: Obtener nombre');

        const developer = await adapterAPI.findDeveloperByEmail(email);
        // const developer = (await adapterAPI.getDevelopers()).developers.find(d => d.email === email);

        console.log('[SEDA Developer Connect] Step 3: Fin');

        return {
            developerId: developer?.id,
            token: response.token,
            name: developer.name
        };
    } catch (error) {
        console.error('[SEDA Developer] Error connecting developer:', error);
        throw error;
    }
};

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

    const {developers} = await adapterAPI.getDevelopers();

    developers.forEach(developer => {
        exports.cleanDeveloper(developer);
    });

    return developers;
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

    const {developer} = await adapterAPI.getDeveloper(developerId);

    exports.cleanDeveloper(developer);

    return developer;
};

// Eliminar las propiedades que no me interesan:
exports.cleanDeveloper = async developer => {

    delete developer._id;
    delete developer.__v;
    delete developer.imageData;
    delete developer.imageMimeType;
    delete developer.createdAt;
    delete developer.updatedAt;
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
                            {model: User, as: "user"},
                            {model: Language, as: "languages"},
                            {model: Attachment, as: "attachment"},
                            {model: Role, as: "role"},
                            {model: Proficiency, as: "proficiency"},
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
 * @param {object} preparedData - Datos para registar a un usuario en Virto.
 * @throws {Error} Si falta algún parámetro obligatorio.
 */
exports.developerCreate = async (email, name, preparedData) => {

    if (!email) {
        throw new Error('El campo email es obligatorio para registrar un developer.');
    }

    if (!name) {
        throw new Error('El campo name es obligatorio para registrar un developer.');
    }

    if (!preparedData) {
        throw new Error('El campo preparedData es obligatorio para registrar un developer.');
    }

    try {
        // ------ PASO 1: Crear la cuenta base con /adapter/v1/custom-register

        console.log('[SEDA Developer] Step 1: Creating account with custom-register');

        const response = await adapterAPI.customRegister(preparedData);

        if (response.success) {
            console.log('[SEDA Developer] Account creation is successfull:', response.message);
        } else {
            console.log('[SEDA Developer] Account creation has failed:', response.error);
            throw new Error(response.error);
        }

        // ------ PASO 2: Completar el perfil de developer con /adapter/v1/developers

        console.log('[SEDA Developer] Step 2: Completing developer profile');

        const response2 = await adapterAPI.createDeveloper(email, name);
        console.log('[SEDA Developer] Developer profile completed:', response2);

    } catch (error) {
        console.error('[SEDA Developer] Error creating developer:', error);
        throw error;
    }

}

//-----------------------------------------------------------

/**
 * Actualiza los datos de un desarrollador, incluyendo habilidades, lenguajes y adjunto.
 *
 * @async
 * @function developerUpdate
 * @param {number} developerId - ID del desarrollador a actualizar.
 *
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
 *
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados del desarrollador.
 */
exports.developerUpdate = async (developerId, data, image) => {
    try {

        const updatedDeveloper = await adapterAPI.updateDeveloper(developerId, data, image);
        return updatedDeveloper;

    } catch (error) {
        console.error("[SEDA developerUpdate] Error updating developer:", error);
        throw error;
    }
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

    return await adapterAPI.findDeveloperByEmail(email);

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

    try {
        return await adapterAPI.getDeveloperAttachment(developerId);
    } catch (error) {
        console.error('[SEDA Developer Attachment] Error:', error);
        return null;
    }
};

//-----------------------------------------------------------


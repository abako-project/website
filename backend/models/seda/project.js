
const {adapterAPI} = require('../adapter');

//-----------------------------------------------------------

/**
 * Devuelve todos los datos del proyecto, incluyendo relaciones como cliente, consultor,
 * objetivos, restricciones, hitos, tareas y comentarios.
 *
 * @async
 * @function project
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<Object>} Objeto JSON con todos los datos del proyecto.
 * @throws {Error} Si no se encuentra el proyecto con el ID dado.
 */
exports.project = async projectId => {

    const seda = require("./index");

    let project = await adapterAPI.getProjectInfo(projectId);

    require("../../helpers/logs").log(project, "project(" + projectId + ")");

    const clients = await seda.clientIndex();
    const developers = await seda.developerIndex();

    let milestones;
    if (project.creationStatus == "created") {
        milestones = await seda.milestones(projectId);
    } else {
        milestones = [];
    }

    // Modificar propiedades:

    project.deliveryDate = project.deliveryDate ? new Date(project.deliveryDate) : Date.now();

    // Crear nuevas propiedades:

    project.id = project._id;

    project.client = clients.find(client => client.id == project.clientId);

    if (project.consultantId) {
        project.consultant = developers.find(developer => developer.id == project.consultantId);
    }

    milestones.forEach(milestone => {
        milestone.developer = developers.find(developer => developer.id == milestone.developerId);
    });
    project.milestones = milestones;

    project.objectives = [];
    project.constraints = [];

    // Eliminar propiedades que no interesan:

    delete project._id;
    delete project.__v;

    // require("../../helpers/logs").log(project, "project");

    return project;
};

//-----------------------------------------------------------

/**
 * Devuelve el ID del cliente asociado a un proyecto.
 *
 * @async
 * @function projectClientId
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<number>} ID del cliente.
 * @throws {Error} Si no se encuentra el proyecto.
 */
exports.projectClientId = async projectId => {

    let project = await adapterAPI.getProjectInfo(projectId);

    if (project) {
        return project?.clientId;
    } else {
        throw new Error('There is no project with id=' + projectId);
    }
};

//-----------------------------------------------------------

/**
 * Devuelve el ID del consultor asociado a un proyecto.
 *
 * @async
 * @function projectConsultantId
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<number>} ID del consultor.
 * @throws {Error} Si no se encuentra el proyecto.
 */
exports.projectConsultantId = async projectId => {

    let project = await adapterAPI.getProjectInfo(projectId);

    return project?.consultantId;

};

//-----------------------------------------------------------

// Dado el id de un proyecto, devuelve la address de su contrato.
exports.projectContractAddress = async projectId => {

    let project = await adapterAPI.getProjectInfo(projectId);

    return project?.contractAddress;
};

//-----------------------------------------------------------

/**
 * Devuelve un índice de proyectos filtrado por cliente, consultor o desarrollador.
 * Si no se pasa ningún parámetro, devuelve todos los proyectos.
 *
 * @async
 * @function projectsIndex
 * @param {?number} clientId - ID del cliente (opcional).
 * @param {?number} consultantId - ID del consultor (opcional).
 * @param {?number} developerId - ID del desarrollador (opcional).
 * @returns {Promise<Object[]>} Lista de proyectos en formato JSON.
 * @throws {Error} Si ocurre un error en la consulta.
 */
exports.projectsIndex = async (clientId, developerId) => {

    const seda = require("./index");

    let projects;

    // Todos los clientes
    const clients = await seda.clientIndex();
    //require("../../helpers/logs").log(clients, "Clientes");

    // todos los developers
    const developers = await seda.developerIndex();
    //  require("../../helpers/logs").log(developers, "Developers");

    if (clientId) {  // Los proyectos de un cliente

        projects = await adapterAPI.getClientProjects(clientId);

        // require("../../helpers/logs").log(projects, "Proyectos ORIGINAL");

    } else {

        // require("../../helpers/logs").log(developerId, "projectsIndex");

        // Obtener todos los proyectos:

        projects = [];
        const projectIds = new Set();

        for (let client of clients) {
            const clientProjects = await adapterAPI.getClientProjects(client.id);
            clientProjects.forEach(project => {
                if (!projectIds.has(project._id)) {
                    projectIds.add(project._id);
                    projects.push(project);
                }
            });
        }

        for (let developer of developers) {
            const developerProjects = await adapterAPI.getDeveloperProjects(developer.id);
            developerProjects.forEach(project => {
                if (!projectIds.has(project._id)) {
                    projectIds.add(project._id);
                    projects.push(project);
                }
            });
        }


        // Si no existe developerId, devuelvo todos los proyectos
        // Si existe developerId, filtro para devuelvo solo los proyectos en los que ese developerId es consultor o developer de alguna task.

        if (developerId) {  // Los proyectos en los que soy consultor o desarrollador de alguna trak.

            // Milestones en los que developerId es desarrollador:
            const {milestones: developerMilestones} = await adapterAPI.getDeveloperMilestones(developerId);

            // ids de los proyectos en los que developerId es desarrollador:
            const developerProjectIds = developerMilestones.map(milestone => milestone.project._id );

            projects = projects.filter(({consultantId, _id}) =>
                consultantId == developerId || developerProjectIds.includes(_id)
            );
        }

    }

    for (let project of projects) {

        // Modificar propiedades:

        project.deliveryDate = project.deliveryDate ? new Date(project.deliveryDate) : Date.now();

        // Crear nuevas propiedades:

        project.id = project._id;

        project.client = clients.find(client => client.id == project.clientId);

        if (project.consultantId) {
            project.consultant = developers.find(developer => developer.id == project.consultantId);
        }

        // project.milestones ||= [];
        if (project.creationStatus == "created") {
            const milestones = await seda.milestones(project.id);
            milestones.forEach(milestone => {
                milestone.developer = developers.find(developer => developer.id == milestone.developerId);
            });
            project.milestones = milestones;

            /*
            const workers = await seda.registeredWorkers();
            require("../../helpers/logs").log(workers, "workers");

            const developers = await seda.developerIndex();

            for (const developer of developers) {
                const developerWorkerAddress = await seda .getWorkerAddress(developer.email);
                developer.developerWorkerAddress = developerWorkerAddress;
            }
            require("../../helpers/logs").log(developers, "developers");

            for (const developer of developers) {
                const developerMilestones = await adapterAPI.getDeveloperMilestones(developer.id);
                require("../../helpers/logs").log(developerMilestones, "developer " + developer.id + " Milestones");
            }
           */

        } else {
            project.milestones = [];
        }

        project.objectives = [];
        project.constraints = [];

        // Eliminr propiedades que no interesan:

        delete project._id;
        delete project.__v;
    }

  //  require("../../helpers/logs").log(projects, "Proyectos LIMPIO");

    return projects;
}

//-----------------------------------------------------------

/**
 * Actualiza el estado de un proyecto.
 *
 * @async
 * @function projectSetState
 * @param {number} projectId - ID del proyecto.
 * @param {string} state - Nuevo estado a asignar.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del estado.
 */
exports.projectSetState = async (projectId, state) => {

    throw new Error('Internal Error. To be removed.');

    // await Project.update({state}, {where: {id: projectId}});
};

//-----------------------------------------------------------

/**
 * El consultor rechaza un proyecto.
 *
 * @async
 * @function rejectProposal
 * @param {string|number} projectId - Contract address or ID del proyecto.
 * @param {string} proposalRejectionReason - Consultant proposal rejection reason.
 * @param {string} [token] - Auth token.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del estado.
 */
exports.rejectProposal = async (projectId, proposalRejectionReason, token) => {

        await adapterAPI.coordinatorRejectProject(projectId, proposalRejectionReason, token);

};

//-----------------------------------------------------------

/**
 * Ya se ha hecho el pago y ahora empieza el projecto.
 * Lo primero va a ser seleccionar al equipo de desarrolladores.
 *
 * @async
 * @function projectStart
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del proyecto.
 */
exports.projectStart = async (projectId) => {

    /*
    await Project.update({
        state: states.ProjectState.ProjectInProgress
    }, {where: {id: projectId}});
    */
};

//-----------------------------------------------------------

/**
 * Ya se han valorado a los desarrolladores.
 * El proyecto se ha completado.
 *
 * @async
 * @function projectCompleted
 * @param {string|number} projectId - Contract address or ID del proyecto.
 * @param {Array} [ratings] - Ratings for team members.
 * @param {string} [token] - Auth token.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del proyecto.
 */
exports.projectCompleted = async (projectId, ratings, token) => {

    await adapterAPI.markCompleted(projectId, ratings, token);

};

//-----------------------------------------------------------

/**
 * Asigna un equipo al proyecto.
 *
 * @async
 * @function assignTeam
 * @param {string} contractAddress - Contract address del proyecto.
 * @param {number} teamSize - Tamaño del equipo.
 * @param {string} token - Auth token.
 * @returns {Promise<Object>} Response del backend.
 */
exports.assignTeam = async (contractAddress, teamSize, token) => {
    try {
        return await adapterAPI.assignTeam(contractAddress, teamSize, token);
    } catch (error) {
        console.error(`[SEDA Project] Error assigning team:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Obtiene la información del equipo del proyecto.
 *
 * @async
 * @function getTeam
 * @param {string} contractAddress - Contract address del proyecto.
 * @returns {Promise<Object>} Información del equipo.
 */
exports.getTeam = async (contractAddress) => {
    try {
        return await adapterAPI.getTeam(contractAddress);
    } catch (error) {
        console.error(`[SEDA Project] Error getting team:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Obtiene la información del scope del proyecto.
 *
 * @async
 * @function getScopeInfo
 * @param {string} contractAddress - Contract address del proyecto.
 * @returns {Promise<Object>} Información del scope.
 */
exports.getScopeInfo = async (contractAddress) => {
    try {
        return await adapterAPI.getScopeInfo(contractAddress);
    } catch (error) {
        console.error(`[SEDA Project] Error getting scope info:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Obtiene todas las tareas del proyecto.
 *
 * @async
 * @function getAllTasks
 * @param {string} contractAddress - Contract address del proyecto.
 * @returns {Promise<Array>} Lista de tareas.
 */
exports.getAllTasks = async (contractAddress) => {
    try {
        return await adapterAPI.getAllTasks(contractAddress);
    } catch (error) {
        console.error(`[SEDA Project] Error getting all tasks:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Obtiene una tarea específica del proyecto.
 *
 * @async
 * @function getTask
 * @param {string} contractAddress - Contract address del proyecto.
 * @param {number} taskId - ID de la tarea.
 * @returns {Promise<Object>} Información de la tarea.
 */
exports.getTask = async (contractAddress, taskId) => {
    try {
        return await adapterAPI.getTask(contractAddress, taskId);
    } catch (error) {
        console.error(`[SEDA Project] Error getting task:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Completa una tarea del proyecto.
 *
 * @async
 * @function completeTask
 * @param {string} contractAddress - Contract address del proyecto.
 * @param {number} taskId - ID de la tarea.
 * @param {string} token - Auth token.
 * @returns {Promise<Object>} Response del backend.
 */
exports.completeTask = async (contractAddress, taskId, token) => {
    try {
        return await adapterAPI.completeTask(contractAddress, taskId, token);
    } catch (error) {
        console.error(`[SEDA Project] Error completing task:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Obtiene el estado de completación de una tarea.
 *
 * @async
 * @function getTaskCompletionStatus
 * @param {string} contractAddress - Contract address del proyecto.
 * @param {number} taskId - ID de la tarea.
 * @returns {Promise<Object>} Estado de la tarea.
 */
exports.getTaskCompletionStatus = async (contractAddress, taskId) => {
    try {
        return await adapterAPI.getTaskCompletionStatus(contractAddress, taskId);
    } catch (error) {
        console.error(`[SEDA Project] Error getting task completion status:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Actualiza el proyecto en el backend.
 *
 * @async
 * @function updateProject
 * @param {string} contractAddress - Contract address del proyecto.
 * @param {Object} data - Datos a actualizar.
 * @param {string} token - Auth token.
 * @returns {Promise<Object>} Response del backend.
 */
exports.updateProject = async (contractAddress, data, token) => {
    try {
        return await adapterAPI.updateProject(contractAddress, data, token);
    } catch (error) {
        console.error(`[SEDA Project] Error updating project:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Establece el contrato de calendario para el proyecto.
 *
 * @async
 * @function setCalendarContract
 * @param {string} contractAddress - Contract address del proyecto.
 * @param {string} calendarContractAddress - Address del contrato de calendario.
 * @param {string} token - Auth token.
 * @returns {Promise<Object>} Response del backend.
 */
exports.setCalendarContract = async (contractAddress, calendarContractAddress, token) => {
    try {
        return await adapterAPI.setCalendarContract(contractAddress, calendarContractAddress, token);
    } catch (error) {
        console.error(`[SEDA Project] Error setting calendar contract:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

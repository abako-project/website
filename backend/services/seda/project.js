const {adapterAPI} = require('../api-client');

const {Op} = require("sequelize");

const json = require("./json");

const {
    models: {
        Project, Client, Developer, User, Attachment, Budget, DeliveryTime, ProjectType,
        Objective, Constraint, Milestone, Role, Proficiency, Comment, Skill
    }
} = require('../../models');

const states = require("../../core/state");
const apiConfig = require("../../config/api.config");


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

    let project = await adapterAPI.getProjectInfo(projectId);

    project.id = project.contractAddress;

    /*
    const clientId = 1;
    const projects = (await exports.projectsIndex(1));

    const len = projects.length;
    // project = len ? projects[len-1] : null;
    project = projects.at(-1);

    project.client = (await adapterAPI.getClient(clientId)).client;
*/

    project.objectives = [];
    project.constraints = [];

    console.log("------- Project--------------------------------");
    console.log(JSON.stringify(project, undefined, 2));
    console.log("---------------------------------------");


    return project;

    //---------

    /*
    const project = await Project.findByPk(projectId, {
        include: [
            {
                model: Client, as: 'client',
                include: [
                    {model: User, as: "user"},
                    {model: Attachment, as: "attachment"}]
            },
            {
                model: Developer, as: 'consultant',
                include: [
                    {model: User, as: "user"},
                    {model: Attachment, as: "attachment"}]
            },
            {model: Budget, as: "budget"},
            {model: DeliveryTime, as: "deliveryTime"},
            {model: ProjectType, as: "projectType"},
            {
                model: Objective, as: 'objectives',
                separate: true,
                order: [['displayOrder', 'ASC']]
            },
            {
                model: Constraint, as: 'constraints',
                separate: true,
                order: [['displayOrder', 'ASC']]
            },
            {
                model: Milestone, as: 'milestones',
                separate: true,
                order: [['displayOrder', 'ASC']],
                include: [
                    {
                        model: Developer, as: 'developer',
                        include: [
                            {model: User, as: "user"},
                            {model: Attachment, as: "attachment"}]
                    },
                    {model: DeliveryTime, as: "deliveryTime"},
                    {model: Role, as: 'role'},
                    {model: Proficiency, as: 'proficiency'},
                    {model: Skill, as: 'skills'},
                ]
            },
            {
                model: Comment, as: "comments",
                separate: true,
                order: [['createdAt', 'DESC']],
            }
        ]
    });
    if (project) {
        return json.projectJson(project);
    } else {
        throw new Error('There is no project with id=' + projectId);
    }

     */
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

    const project = await Project.findByPk(projectId);

    if (project) {
        return project.clientId;
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

    const project = await Project.findByPk(projectId);

    if (project) {
        return project.consultantId;
    } else {
        throw new Error('There is no project with id=' + projectId);
    }
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
exports.projectsIndex = async (clientId, consultantId, developerId) => {

    if (clientId) {
        const response = await adapterAPI.getClientProjects(clientId);

       response.forEach(project => {project.id = project.contractAddress});

        return response;
    }

    if (consultantId) {
        const response = await adapterAPI.getDeveloperProjects(consultantId);

        response.forEach(project => {project.id = project.contractAddress});

        return response;
    }

    if (developerId) {
        const response = await adapterAPI.getDeveloperProjects(developerId);

        response.forEach(project => {project.id = project.contractAddress});

        return response;
    }

    // All Projects
    const clients = (await adapterAPI.getClients()).clients;
    const developers = (await adapterAPI.getClients()).developers;

    let projects = [];
    clients && clients.forEach(async client => {
        const clientProjects = await adapterAPI.getClientProjects(client.id);

        response.forEach(project => {project.id = project.contractAddress});

        projects = projects.concat(clientProjects);
    });
    developers && developers.forEach(async developer => {
        const developerProjects = await adapterAPI.getDeveloperProjects(developer.id);

        response.forEach(project => {project.id = project.contractAddress});

        projects = projects.concat(developerProjects);
    })
    return projects;
}

exports.projectsIndex_BBDD = async (clientId, consultantId, developerId) => {

    let options = {
        include: [
            {
                model: Client, as: 'client',
                include: [
                    {model: User, as: "user"},
                    {model: Attachment, as: "attachment"}]
            },
            {
                model: Developer, as: 'consultant',
                include: [
                    {model: User, as: "user"},
                    {model: Attachment, as: "attachment"}]
            },
            {
                model: Milestone, as: 'milestones',
                include: [
                    {model: Developer, as: 'developer'}
                ]
            }
        ]
    };

    const orItems = [];
    if (clientId) {
        orItems.push({clientId});
    }
    if (consultantId) {
        orItems.push({consultantId});
    }
    if (developerId) {
        orItems.push({'$milestones.developerId$': developerId});
    }
    if (orItems.length > 0) {
        options.where = {
            [Op.or]: orItems
        };
    }

    const projects = await Project.findAll(options);

    return projects.map(project => json.projectJson(project));
};

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
    await Project.update({state}, {where: {id: projectId}});
};

//-----------------------------------------------------------

/**
 * Rechaza un proyecto (rol DAO/Admin) cambiando su estado a `ProposalRejected`.
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
    try {
        // Try to reject on backend
        await adapterAPI.coordinatorRejectProject(projectId, proposalRejectionReason, token);
    } catch (error) {
        console.warn(`[SEDA Project] Could not reject on backend, falling back to SQLite:`, error.message);
        
        // Fallback to SQLite
        await Project.update({
            state: states.ProjectState.ProposalRejected,
            proposalRejectionReason
        }, {where: {id: projectId}});
    }
};

//-----------------------------------------------------------

/**
 * Asigna un consultor a un proyecto y cambia el estado a `WaitingForProposalApproval`.
 *
 * @async
 * @function projectSetConsultant
 * @param {string|number} projectId - Contract address or ID del proyecto.
 * @param {number} consultantId - ID del consultor.
 * @param {string} [token] - Auth token.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la asignación del consultor o la actualización del estado.
 */
exports.projectSetConsultant = async (projectId, consultantId, token) => {
    try {
        // Try to assign coordinator on backend
        await adapterAPI.assignCoordinator(projectId, token);
    } catch (error) {
        console.warn(`[SEDA Project] Could not assign coordinator on backend, falling back to SQLite:`, error.message);
        
        // Fallback to SQLite
        await Project.update({
            consultantId,
            state: states.ProjectState.WaitingForProposalApproval
        }, {where: {id: projectId}});
    }
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

    await Project.update({
        state: states.ProjectState.ProjectInProgress
    }, {where: {id: projectId}});

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
    try {
        // Try to mark completed on backend
        await adapterAPI.markCompleted(projectId, ratings, token);
    } catch (error) {
        console.warn(`[SEDA Project] Could not mark completed on backend, falling back to SQLite:`, error.message);
        
        // Fallback to SQLite
        await Project.update({
            state: states.ProjectState.Completed
        }, {where: {id: projectId}});
    }
};
//-----------------------------------------------------------

/**
 * Elimina un proyecto por su ID.
 *
 * @async
 * @function projectDestroy
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<void>}
 * @throws {Error} Si ocurre un error al eliminar el proyecto.
 */
exports.projectDestroy = async projectId => {
    await Project.destroy({where: {id: projectId}});
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

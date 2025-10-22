const {Op} = require("sequelize");

const json = require("./json");

const {
    models: {
        Project, Client, Developer, User, Attachment, Budget, DeliveryTime, ProjectType,
        Objective, Constraint, Milestone, Role, Proficiency, Comment, Skill
    }
} = require('../../models');

const states = require("../../core/state");


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
 * Si la propuesta no se ha publicado ya, entonces publica la propuesta y cambia su estado a `ProposalPending`.
 * Si la propuesta fue publicada y rechazada, entonces la republica y pasa al estado WaitingForProposalApproval.
 *
 * @async
 * @function proposalSubmit
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del estado.
 */
exports.proposalSubmit = async (projectId) => {

    const project = await Project.findByPk(projectId);

    if (!project) {
        throw new Error('There is no project with id=' + projectId);
    }

    if (!project.state) {
        await Project.update({
            state: states.ProjectState.ProposalPending
        }, {where: {id: projectId}});
    } else if (project?.state === states.ProjectState.ProposalRejected) {
        await Project.update({
            state: states.ProjectState.WaitingForProposalApproval
        }, {where: {id: projectId}});
    } else {
        throw new Error('Internal Error. Invalid project state.');
    }
};


//-----------------------------------------------------------

/**
 * Aprueba un proyecto (rol DAO/Admin) cambiando su estado a `ScopingInProgress`.
 *
 * @async
 * @function approveProposal
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del estado.
 */
exports.approveProposal = async (projectId) => {
    await Project.update({
        state: states.ProjectState.ScopingInProgress
    }, {where: {id: projectId}});
};


//-----------------------------------------------------------

/**
 * Rechaza un proyecto (rol DAO/Admin) cambiando su estado a `ProposalRejected`.
 *
 * @async
 * @function rejectProposal
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del estado.
 */
exports.rejectProposal = async (projectId) => {
    await Project.update({
        state: states.ProjectState.ProposalRejected
    }, {where: {id: projectId}});
};

//-----------------------------------------------------------

/**
 * Asigna un consultor a un proyecto y cambia el estado a `WaitingForProposalApproval`.
 *
 * @async
 * @function projectSetConsultant
 * @param {number} projectId - ID del proyecto.
 * @param {number} consultantId - ID del consultor.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la asignación del consultor o la actualización del estado.
 */
exports.projectSetConsultant = async (projectId, consultantId) => {

    await Project.update({
        consultantId,
        state: states.ProjectState.WaitingForProposalApproval
    }, {where: {id: projectId}});
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

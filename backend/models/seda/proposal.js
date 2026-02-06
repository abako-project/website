
const {adapterAPI} = require("../adapter");

//-----------------------------------------------------------

/**
 * Crea un nuevo proyecto a partir de la propuesta inicial de un cliente.
 * Solo se guardan los datos básicos de la propuesta, sin objetivos ni restricciones.
 *
 * @async
 * @function proposalCreate
 * @param {number} clientId - ID del cliente que crea la propuesta.
 * @param {Object} data - Datos de la propuesta.
 * @param {string} data.title - Título del proyecto.
 * @param {string} data.summary - Resumen del proyecto.
 * @param {number} data.projectTypeId - Id del tipo de proyecto.
 * @param {string} data.description - Descripción detallada.
 * @param {string} data.url - URL de referencia.
 * @param {number} data.budgetId - Id del presupuesto estimado.
 * @param {number} data.deliveryTimeId - Id de la hora de entrega estimado.
 * @param {string} data.deliveryDate - Fecha estimada de entrega.
 * @returns {Promise<string>} string con la direccion del contrato creado.
 */
exports.proposalCreate = async (clientId, {title, summary, projectType, description, url, budget, deliveryTime, deliveryDate}, token) => {

    const response = await adapterAPI.deployProject(
        "v5",
         {
            title, summary, description, projectType, url, budget, deliveryTime, deliveryDate
        },
        clientId,
        token);

    // require("../../helpers/logs").log(response, "proposalCreate")

    return response.projectId;
};

//-----------------------------------------------------------

/**
 * Actualiza los datos básicos de la propuesta de un proyecto existente.
 * No modifica objetivos ni restricciones.
 *
 * @async
 * @function proposalUpdate
 * @param {string|number} projectId - Contract address or ID del proyecto a actualizar.
 * @param {Object} data - Nuevos valores de la propuesta.
 * @param {string} data.title
 * @param {string} data.summary
 * @param {string} data.description
 * @param {string} data.url
 * @param {number} data.projectTypeId
 * @param {number} data.budgetId
 * @param {number} data.deliveryTimeId
 * @param {string} data.deliveryDate
 * @param {string} [token] - Auth token.
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados del proyecto.
 */
exports.proposalUpdate = async (projectId, {title, summary, description, url, projectType, budget, deliveryTime, deliveryDate}, token) => {

    // Try to update on backend
    const updateData = {
        title,
        summary,
        description,
        url,
        projectType,
        budget,
        deliveryTime,
        deliveryDate
    };

    const response = await adapterAPI.updateProject(projectId, updateData, token);
    return response;
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

    throw new Error('Internal Error. To be adapted.');

    /*
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
     */
};


//-----------------------------------------------------------

/**
 * El consultor aprueba un proyecto .
 *
 * @async
 * @function approveProposal
 * @param {number} projectId - ID del proyecto.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del estado.
 */
exports.approveProposal = async (projectId) => {

};


//-----------------------------------------------------------


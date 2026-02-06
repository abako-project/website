
const {adapterAPI} = require('../adapter');

const states = require("../flowStates");

//-----------------------------------------------------------

exports.milestones = async (projectId) => {

    const {milestones} = await adapterAPI.getAllTasks(projectId);

    require("../../helpers/logs").log(milestones, "getAllTasks");

    milestones.forEach(milestone => {
        exports.cleanMilestone(milestone);
    });

    require("../../helpers/logs").log(milestones, "Milestones");

    return milestones;
};

//-----------------------------------------------------------

exports.cleanMilestone = async milestone => {

    delete milestone._id;
    delete milestone.__v;
    delete milestone.createdAt;
    delete milestone.updatedAt;

}

//-----------------------------------------------------------

/**
 * Devuelve todos los datos de un milestone por su ID,
 * incluyendo el proyecto y sus tareas asociadas.
 *
 * @async
 * @function milestone
 * @param {string|number} projectId - Contract address or project ID.
 * @param {number} milestoneId - ID del milestone.
 * @param {string} [token] - Auth token if needed.
 * @returns {Promise<Object>} Objeto JSON con los datos del milestone.
 * @throws {Error} Si no se encuentra el milestone.
 */
exports.milestone = async (projectId, milestoneId) => {
    const response = await adapterAPI.getTask(projectId, milestoneId);
    return response.milestone || response;
};

//-----------------------------------------------------------

/**
 * Crea un nuevo milestone asociado a un proyecto.
 *
 * @async
 * @function milestoneCreate
 * @param {string|number} projectId - Contract address or project ID.
 * @param {Object} data - Datos del milestone.
 * @param {string} data.title - Título del milestone.
 * @param {string} data.description - Descripción del milestone.
 * @param {number} data.budget - Presupuesto asignado.
 * @param {number} data.deliveryTimeId - Id de la hora de entrega estimado.
 * @param {string} data.deliveryDate - Fecha estimada de entrega.
 * @param {number} [data.roleId]
 * @param {number} [data.proficiencyId]
 * @param {number[]} [data.skillIds]
 * @param {boolean} [data.neededFullTimeDeveloper]
 * @param {boolean} [data.neededPartTimeDeveloper]
 * @param {boolean} [data.neededHourlyDeveloper]
 * @param {string} [token] - Auth token.
 * @returns {Promise<Object>} Objeto JSON del milestone creado.
 */
exports.milestoneCreate = async (scope, projectId, {title, description, budget, deliveryTime, deliveryDate,
  role, proficiency, skills, availability}, token) => {


        // Try to create on backend
        const milestoneData = {
            title,
            description,
            budget,
            deliveryTime,
            deliveryDate,
            role,
            proficiency,
            skills,
            availability,
        };

    scope.milestones.push(milestoneData);

};

//-----------------------------------------------------------

/**
 * Actualiza los datos de un milestone existente.
 *
 * @async
 * @function milestoneUpdate
 * @param {string|number} projectId - Contract address or project ID.
 * @param {number} milestoneId - ID del milestone a actualizar.
 * @param {Object} data - Nuevos valores.
 * @param {string} data.title
 * @param {string} data.description
 * @param {number} data.budget
 * @param {number} data.deliveryTimeId - Id de la hora de entrega estimado.
 * @param {string} data.deliveryDate
 * @param {number} [data.roleId]
 * @param {number} [data.proficiencyId]
 * @param {number[]} [data.skillIds]
 * @param {boolean} [data.neededFullTimeDeveloper]
 * @param {boolean} [data.neededPartTimeDeveloper]
 * @param {boolean} [data.neededHourlyDeveloper]
 * @param {string} [token] - Auth token.
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados.
 */
exports.milestoneUpdate = async (projectId, milestoneId, {title, description, budget, deliveryTime, deliveryDate,
  role, proficiency, skills, availability}, token) => {

        const milestoneData = {
            title,
            description,
            budget,
            deliveryTime,
            deliveryDate,
            role,
            proficiency,
            skills,
            availability,
        };

        const response = await adapterAPI.updateMilestone(projectId, milestoneId, milestoneData, token);
        return response.milestone || response;
};

//-----------------------------------------------------------

/**
 * Intercambia el orden de visualización de dos milestones.
 *
 * @async
 * @function milestoneSwapOrder
 * @param {number} milestoneId1 - ID del primer milestone.
 * @param {number} milestoneId2 - ID del segundo milestone.
 * @returns {Promise<void>}
 * @throws {Error} Si alguno de los milestones no existe o falla la transacción.
 */
exports.milestoneSwapOrder = async (scope, milestoneId1, milestoneId2) => {

    const milestones = scope.milestones;

    const temp = milestones[milestoneId1];
    milestones[milestoneId1] = milestones[milestoneId2];
    milestones[milestoneId2] = temp;

};

//-----------------------------------------------------------

/**
 * Elimina un milestone por su ID.
 *
 * @async
 * @function milestoneDestroy
 * @param {string|number} projectId - Contract address or project ID.
 * @param {number} milestoneId - ID del milestone a eliminar.
 * @param {string} [token] - Auth token.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la eliminación.
 */
exports.milestoneDestroy = async (projectId, milestoneId, token) => {
    await adapterAPI.deleteMilestone(projectId, milestoneId, token);
};

//-----------------------------------------------------------

exports.milestoneDeveloperAccept = async (milestoneId) => {

    throw new Error('Internal Error. To be adapted.');

    /*
    const milestone = await Milestone.findByPk(milestoneId);

    await milestone?.update({state: states.MilestoneState.MilestoneInProgress});


    const milestoneLog = await MilestoneLog.create({
        fromClient: true,
        title: "Client approved Milestone",
    });

    await milestoneLog.setMilestone(milestone);

     */
};

//-----------------------------------------------------------

exports.milestoneDeveloperReject = async (milestoneId) => {

    throw new Error('Internal Error. To be adapted.');

    /*
    let milestone = await Milestone.findByPk(milestoneId);

    // Borrar asignacion actual:
    milestone = await milestone.update({
        developerId: null,
        state: states.MilestoneState.WaitingDeveloperAssignation
    });


    const milestoneLog = await MilestoneLog.create({
        fromClient: true,
        title: "Client rejected Milestone",
    });

    await milestoneLog.setMilestone(milestone);

     */
};

//-----------------------------------------------------------

// Version BBDD

exports.milestoneConsultantSubmit = async (milestoneId, documentation, links) => {

    throw new Error('Internal Error. To be adapted.');

    /*
    let milestone = await Milestone.findByPk(milestoneId);

    // Actualizar el estado, y guardar doc y links
    milestone = await milestone.update({
        state: states.MilestoneState.WaitingClientAcceptSubmission,
        documentation,
        links
    });

     */
};

//-----------------------------------------------------------

exports.milestoneConsultantSubmitForReview = async (projectId, milestoneId, token) => {

    await adapterAPI.submitTaskForReview(projectId, milestoneId, token);

};

//-----------------------------------------------------------

exports.milestoneClientAcceptSubmission = async (projectId, milestoneId, comment, token) => {

    await adapterAPI.completeTask(projectId, milestoneId, token);

};

//-----------------------------------------------------------

exports.milestoneClientRejectSubmission = async (projectId, milestoneId, comment, token) => {

    await adapterAPI.rejectTask(projectId, milestoneId, comment, token);

};

//-----------------------------------------------------------

exports.milestoneClientRollbackRejectedSubmission = async (milestoneId, comment) => {

    throw new Error('Internal Error. To be adapted.');

    /*
    let milestone = await Milestone.findByPk(milestoneId);

    // Borrar asignacion actual:
    milestone = await milestone.update({
        state: states.MilestoneState.WaitingClientAcceptSubmission
    });
     */
};

//-----------------------------------------------------------

/**
 *  El sistema (la DAO) para automaticmante cuando el milestone se ha completado satistactoriamente.
 *
 * @param milestoneId
 * @returns {Promise<void>}
 */
exports.milestoneDaoPay = async (milestoneId) => {

    throw new Error('Internal Error. To be adapted.');

    /*
    let milestone = await Milestone.findByPk(milestoneId);

    // Marcar como pagado:
    milestone = await milestone.update({
        state: states.MilestoneState.Paid
    });

     */
};

//-----------------------------------------------------------

exports.milestoneClientAddHistoryComment = async (milestoneId, comment) => {

    throw new Error('Internal Error. To be adapted.');

    /*
    let milestone = await Milestone.findByPk(milestoneId);

    // Pendiente añadir a la historia:

     */
};

//-----------------------------------------------------------

exports.milestoneConsultantAddHistoryComment = async (milestoneId, comment) => {

    throw new Error('Internal Error. To be adapted.');

    /*
    try {
        let milestone = await Milestone.findByPk(milestoneId);

        // Pendiente añadir a la historia:


    } catch (error) {
        throw error;
    }
    */
};



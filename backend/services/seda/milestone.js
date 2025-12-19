
const json = require("./json");
const {adapterAPI} = require('../api-client');

const {
  models: {Developer, User, Attachment, Project,  Milestone, Role, Proficiency,
    Skill, DeliveryTime, MilestoneLog}
} = require('../../models');

const sequelize = require("../../models");

const states = require("../../core/state");
const seda = require("./index");

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
exports.milestone = async (projectId, milestoneId, token) => {
    try {
        // Try to get from backend first
        const response = await adapterAPI.getMilestone(projectId, milestoneId, token);
        return response.milestone || response;
    } catch (error) {
        console.warn(`[SEDA Milestone] Could not fetch from backend, falling back to SQLite:`, error.message);
        
        // Fallback to SQLite
        const milestone = await Milestone.findByPk(milestoneId, {
            include: [
                {model: Project, as: 'project'},
                {model: Role, as: 'role'},
                {model: Proficiency, as: "proficiency"},
                {model: DeliveryTime, as: "deliveryTime"},
                {model: Skill, as: "skills"},
                {
                    model: Developer, as: 'developer',
                    include: [
                        {model: User, as: "user"},
                        {model: Attachment, as: "attachment"}]
                }
            ],
        });

        if (milestone) {
            return json.milestoneJson(milestone);
        } else {
            throw new Error('There is no milestone with id=' + milestoneId);
        }
    }
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
exports.milestoneCreate = async (projectId, {title, description, budget, deliveryTimeId, deliveryDate,
  roleId, proficiencyId, skillIds,
  neededFullTimeDeveloper, neededPartTimeDeveloper, neededHourlyDeveloper}, token) => {

    try {
        // Try to create on backend
        const milestoneData = {
            title,
            description,
            budget,
            deliveryTimeId,
            deliveryDate,
            roleId,
            proficiencyId,
            skillIds,
            neededFullTimeDeveloper,
            neededPartTimeDeveloper,
            neededHourlyDeveloper
        };

        const response = await adapterAPI.createMilestone(projectId, milestoneData, token);
        return response.milestone || response;
        
    } catch (error) {
        console.warn(`[SEDA Milestone] Could not create on backend, falling back to SQLite:`, error.message);
        
        // Fallback to SQLite
        let milestone = await Milestone.create({
            title, description, budget, deliveryTimeId, deliveryDate, projectId, roleId, proficiencyId,
            neededFullTimeDeveloper, neededPartTimeDeveloper, neededHourlyDeveloper
        });

        await milestone.setSkills(skillIds);

        const milestoneLog = await MilestoneLog.create({
            fromConsultant: true,
            title: "Milestone Defined",
            msg: `
              * ${title}
              * ${description}
              * ${budget}
              * ${deliveryTimeId}
            `
        });

        await milestoneLog.setMilestone(milestone);

        return json.milestoneJson(milestone);
    }
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
exports.milestoneUpdate = async (projectId, milestoneId, {title, description, budget, deliveryTimeId, deliveryDate,
  roleId, proficiencyId, skillIds, neededFullTimeDeveloper, neededPartTimeDeveloper, neededHourlyDeveloper}, token) => {

    try {
        // Try to update on backend
        const milestoneData = {
            title,
            description,
            budget,
            deliveryTimeId,
            deliveryDate,
            roleId,
            proficiencyId,
            skillIds,
            neededFullTimeDeveloper,
            neededPartTimeDeveloper,
            neededHourlyDeveloper
        };

        const response = await adapterAPI.updateMilestone(projectId, milestoneId, milestoneData, token);
        return response.milestone || response;
        
    } catch (error) {
        console.warn(`[SEDA Milestone] Could not update on backend, falling back to SQLite:`, error.message);
        
        // Fallback to SQLite
        let milestone = await Milestone.findByPk(milestoneId);

        milestone = await milestone.update({
            title, description, budget, deliveryTimeId, deliveryDate, roleId, proficiencyId,
            neededFullTimeDeveloper, neededPartTimeDeveloper, neededHourlyDeveloper
        });

        await milestone.setSkills(skillIds);

        const milestoneLog = await MilestoneLog.create({
            fromConsultant: true,
            title: "Milestone Edited",
            msg: `
              * ${title}
              * ${description}
              * ${budget}
              * ${deliveryTimeId}
            `
        });

        await milestoneLog.setMilestone(milestone);

        return json.milestoneJson(milestone);
    }
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
exports.milestoneSwapOrder = async (milestoneId1, milestoneId2) => {

  const transaction = await sequelize.transaction();
  try {
    const milestone1 = await Milestone.findByPk(milestoneId1, {transaction});
    if (!milestone1) {
      throw new Error('Milestone 1 not found.');
    }

    const milestone2 = await Milestone.findByPk(milestoneId2, {transaction});
    if (!milestone2) {
      throw new Error('Milestone 2 not found.');
    }

    const displayOrder1 = milestone1.displayOrder;
    const displayOrder2 = milestone2.displayOrder;

    // Intercambiamos posiciones
    await milestone1.update({displayOrder: displayOrder2}, {transaction}),
      await milestone2.update({displayOrder: displayOrder1}, {transaction})

    await transaction.commit();

  } catch(error) {
    await transaction.rollback();
    throw error;
  }
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
    try {
        // Try to delete from backend
        await adapterAPI.deleteMilestone(projectId, milestoneId, token);
    } catch (error) {
        console.warn(`[SEDA Milestone] Could not delete from backend, falling back to SQLite:`, error.message);
        // Fallback to SQLite
        await Milestone.destroy({where: {id: milestoneId}});
    }
};

//-----------------------------------------------------------

/**
 * Asigna un desarrollador a un milestgone, eliminando cualquier asignación previa.
 *
 * @async
 * @function milestoneAssignDeveloper
 * @param {number} milestoneId - ID del milestone.
 * @param {number} [developerId] - ID del desarrollador (opcional).
 * @returns {Promise<void>}
 */
exports.milestoneAssignDeveloper = async (milestoneId, developerId) => {

    try {
        let milestone = await Milestone.findByPk(milestoneId);

        if (developerId) {
            // Crear nueva asignacion:
            milestone = await milestone.update({
                developerId,
                state: states.MilestoneState.WaitingDeveloperAcceptAssignation
            });
        } else {
            // Borrar asignacion actual:
            milestone = await milestone.update({
                developerId: null,
                state: states.MilestoneState.WaitingDeveloperAssignation
            });
        }
    } catch (error) {
        throw error;
    }
};

//-----------------------------------------------------------

exports.milestoneDeveloperAccept = async (milestoneId) => {

    try {
        const milestone = await Milestone.findByPk(milestoneId);

        await milestone?.update({state: states.MilestoneState.MilestoneInProgress});


        const milestoneLog = await MilestoneLog.create({
            fromClient: true,
            title: "Client approved Milestone",
        });

        await milestoneLog.setMilestone(milestone);

    } catch (error) {
        throw error;
    }
};

//-----------------------------------------------------------

exports.milestoneDeveloperReject = async (milestoneId) => {

    try {
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

    } catch (error) {
        throw error;
    }
};

//-----------------------------------------------------------

exports.milestoneConsultantSubmit = async (milestoneId, documentation, links) => {

    try {
        let milestone = await Milestone.findByPk(milestoneId);

        // Actualizar el estado, y guardar doc y links
        milestone = await milestone.update({
            state: states.MilestoneState.WaitingClientAcceptSubmission,
            documentation,
            links
        });

    } catch (error) {
        throw error;
    }
};

//-----------------------------------------------------------

exports.milestoneClientAcceptSubmission = async (milestoneId, comment) => {

    try {
        const milestone = await Milestone.findByPk(milestoneId);

        await milestone?.update({state: states.MilestoneState.AwaitingPayment});

    } catch (error) {
        throw error;
    }
};

//-----------------------------------------------------------

exports.milestoneClientRejectSubmission = async (milestoneId, comment) => {

    try {
        let milestone = await Milestone.findByPk(milestoneId);

        // Borrar asignacion actual:
        milestone = await milestone.update({
            state: states.MilestoneState.SubmissionRejectedByClient
        });

    } catch (error) {
        throw error;
    }
};

//-----------------------------------------------------------

exports.milestoneClientRollbackRejectedSubmission = async (milestoneId, comment) => {

    try {
        let milestone = await Milestone.findByPk(milestoneId);

        // Borrar asignacion actual:
        milestone = await milestone.update({
            state: states.MilestoneState.WaitingClientAcceptSubmission
        });

    } catch (error) {
        throw error;
    }
};

//-----------------------------------------------------------

/**
 *  El sistema (la DAO) para automaticmante cuando el milestone se ha completado satistactoriamente.
 *
 * @param milestoneId
 * @returns {Promise<void>}
 */
exports.milestoneDaoPay = async (milestoneId) => {

    try {
        let milestone = await Milestone.findByPk(milestoneId);

        // Marcar como pagado:
        milestone = await milestone.update({
            state: states.MilestoneState.Paid
        });

    } catch (error) {
        throw error;
    }
};

//-----------------------------------------------------------

exports.milestoneClientAddHistoryComment = async (milestoneId, comment) => {

    try {
        let milestone = await Milestone.findByPk(milestoneId);

        // Pendiente añadir a la historia:


    } catch (error) {
        throw error;
    }
};

//-----------------------------------------------------------

exports.milestoneConsultantAddHistoryComment = async (milestoneId, comment) => {

    try {
        let milestone = await Milestone.findByPk(milestoneId);

        // Pendiente añadir a la historia:


    } catch (error) {
        throw error;
    }
};

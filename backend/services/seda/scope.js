

const json = require("./json");
const {adapterAPI} = require('../api-client');

const {
  models: {
    Project, Comment
  }
} = require('../../models');

const states = require("../../core/state");


//-----------------------------------------------------------


/**
 * Publica el scope del proyecto.
 * Cambia el estado del proyecto a `ScopeValidationNeeded`
 * y crea un comentario del consultor.
 *
 * @async
 * @function scopeSubmit
 * @param {string|number} projectId - Contract address or ID del proyecto.
 * @param {Array} milestones - Array de milestones para el scope.
 * @param {number} advancePaymentPercentage - Porcentaje de pago adelantado.
 * @param {string} documentHash - Hash del documento del scope.
 * @param {string} token - Auth token.
 * @param {string} [consultantComment] - Comentario del consultor (opcional para SQLite).
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del proyecto o la creación del comentario.
 */
exports.scopeSubmit = async (projectId, milestones, advancePaymentPercentage, documentHash, consultantComment, token) => {

    await adapterAPI.proposeScope(projectId, milestones, advancePaymentPercentage, documentHash, token);

};

//-----------------------------------------------------------


/**
 * Acepta el scope del proyecto por parte del cliente.
 * Cambia el estado del proyecto a `EscrowFundingNeeded` y actualiza
 * el último comentario con la respuesta del cliente.
 *
 * @async
 * @function scopeAccept
 * @param {string|number} projectId - Contract address or ID del proyecto.
 * @param {Array} approvedTaskIds - IDs de las tareas aprobadas.
 * @param {string} token - Auth token.
 * @param {string} [clientResponse] - Respuesta del cliente (opcional para SQLite).
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del proyecto o del comentario.
 */
exports.scopeAccept = async (projectId, approvedTaskIds, token, clientResponse) => {
    try {
        // Try to approve scope on backend
        await adapterAPI.approveScope(projectId, approvedTaskIds, token);
    } catch (error) {
        console.warn(`[SEDA Scope] Could not approve on backend, falling back to SQLite:`, error.message);
        
        // Fallback to SQLite
        await Project.update({
            state: states.ProjectState.EscrowFundingNeeded
        }, {where: {id: projectId}});

        const [comment] = await Comment.findAll({
            where: {projectId},
            order: [['createdAt', 'DESC']]
        });

        if (comment && clientResponse) {
            await comment.update({clientResponse});
        }
    }
};

//-----------------------------------------------------------

/**
 * Rechaza el scope del proyecto por parte del cliente.
 * Cambia el estado del proyecto a `ScopingInProgress` y actualiza
 * el último comentario con la respuesta del cliente.
 *
 * @async
 * @function scopeReject
 * @param {string|number} projectId - Contract address or ID del proyecto.
 * @param {string} clientResponse - Respuesta del cliente al comentario.
 * @param {string} token - Auth token.
 * @returns {Promise<void>}
 * @throws {Error} Si falla la actualización del proyecto o del comentario.
 */
exports.scopeReject = async (projectId, clientResponse, token) => {
    try {
        // Try to reject scope on backend
        await adapterAPI.rejectScope(projectId, clientResponse, token);
    } catch (error) {
        console.warn(`[SEDA Scope] Could not reject on backend, falling back to SQLite:`, error.message);
        
        // Fallback to SQLite
        await Project.update({
            state: states.ProjectState.ScopingInProgress
        }, {where: {id: projectId}});

        const [comment] = await Comment.findAll({
            where: {projectId},
            order: [['createdAt', 'DESC']]
        });

        if (comment) {
            await comment.update({clientResponse});
        }
    }
};

//-----------------------------------------------------------

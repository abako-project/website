

const {adapterAPI} = require('../api-client');


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

    require("../../helpers/logs").log(milestones,"adapterAPI.proposeScope milestones");

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
exports.scopeAccept = async (projectId, approvedTaskIds, clientResponse, token) => {

    require("../../helpers/logs").log(projectId,"projectId");
    require("../../helpers/logs").log(approvedTaskIds,"approvedTaskIds");
    require("../../helpers/logs").log(clientResponse,"clientResponse");
    require("../../helpers/logs").log(token,"token");

    // Try to approve scope on backend
    const response = await adapterAPI.approveScope(projectId, approvedTaskIds, token);

    require("../../helpers/logs").log(response,"Scope Accept response");

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
    // Try to reject scope on backend
    const response = await adapterAPI.rejectScope(projectId, clientResponse, token);

    require("../../helpers/logs").log(response,"Scope Reject response");

};

//-----------------------------------------------------------


const {adapterAPI} = require('../adapter');


//-----------------------------------------------------------

/**
 * Devuelve los developers registrados en el calendar.
 */
exports.registeredWorkers = async () => {

    const response = await adapterAPI.getRegisteredWorkers();
    return response;
}

//-----------------------------------------------------------

/**
 * Devuelve la disponibilidad de los workers.
 */
exports.workersAvailability = async () => {

    const response = await adapterAPI.getAllWorkersAvailability();

    return response;
}

//-----------------------------------------------------------

/**
 * Devuelve la address de un developer (worker) a partir de su email (userId).
 */
exports.getWorkerAddress = async (email) => {

    if (process.env.VIRTO_MOCK) {
        return "address"
    }

    // Peticion al servidor federado:
    const url = `https://dev.abako.xyz/api/get-user-address?userId=${email}`;

    const response = await fetch(url);
    const {address} = await response.json();

    return address;
};

//-----------------------------------------------------------

/**
 * Registrar un worker en el Calendar.
 * Si ya esta registrado no hace nada.
 *
 * El UserId de un worker es el email del desarrollador asociado.
 */
exports.registerWorker = async (userId, token) => {

    // Obtener las addresses de todos los workers registrados en el contrato Calendar:
    const response = await exports.registeredWorkers();
    if (!response.success) {
        throw new Error("No puedo obtener los workers registrados en el calendar.");
    }
    let registeredWorkers = response.response;

    // Obtener mi worker address:
    let address = await exports.getWorkerAddress(userId);
    if (!address) {
        throw new Error("No puedo obtener mi worker address.");
    }

    // Si no estoy registrado en Calendar, registrarme:
    if (!registeredWorkers.includes(address)) {
        let response = await adapterAPI.registerWorker(address, token);
        if (!response.success) {
            throw new Error("No puedo registrarme en el contrato Calendar.");
        }
    }
}

//-----------------------------------------------------------

/**
 * Despliega un nuevo contrato de calendario.
 *
 * @async
 * @function deployCalendar
 * @param {string} version - Versión del contrato (ej: 'v5').
 * @param {string} token - Auth token.
 * @returns {Promise<Object>} Response con la dirección del contrato.
 */
exports.deployCalendar = async (version, token) => {
    try {
        return await adapterAPI.deployCalendar(version, token);
    } catch (error) {
        console.error(`[SEDA Calendar] Error deploying calendar:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Registra múltiples workers en el calendario.
 *
 * @async
 * @function registerWorkers
 * @param {Array<string>} workers - Array de direcciones de workers.
 * @param {string} token - Auth token.
 * @returns {Promise<Object>} Response del backend.
 */
exports.registerWorkers = async (workers, token) => {
    try {
        return await adapterAPI.registerWorkers(workers, token);
    } catch (error) {
        console.error(`[SEDA Calendar] Error registering workers:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Establece la disponibilidad de un worker.
 *
 * @async
 * @function setAvailability
 * @param {string} contractAddress - Dirección del contrato de calendario.
 * @param {number} availability - Horas de disponibilidad.
 * @param {string} token - Auth token.
 * @returns {Promise<Object>} Response del backend.
 */
exports.setAvailability = async (availability, weeklyHours, token) => {
    try {
        return await adapterAPI.setAvailability(availability, weeklyHours, token);
    } catch (error) {
        console.error(`[SEDA Calendar] Error setting availability:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Obtiene las horas de disponibilidad de un worker.
 *
 * @async
 * @function getAvailabilityHours
 * @param {string} contractAddress - Dirección del contrato de calendario.
 * @param {string} worker - Dirección del worker.
 * @returns {Promise<Object>} Horas de disponibilidad.
 */
exports.getAvailabilityHours = async (worker) => {
    try {
        return await adapterAPI.getAvailabilityHours(worker);
    } catch (error) {
        console.error(`[SEDA Calendar] Error getting availability hours:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Verifica si un worker está disponible.
 *
 * @async
 * @function isAvailable
 * @param {string} contractAddress - Dirección del contrato de calendario.
 * @param {string} worker - Dirección del worker.
 * @param {number} [minHours] - Horas mínimas requeridas (opcional).
 * @returns {Promise<Object>} Estado de disponibilidad.
 */
exports.isAvailable = async (worker, minHours) => {
    try {
        return await adapterAPI.isAvailable(worker, minHours);
    } catch (error) {
        console.error(`[SEDA Calendar] Error checking availability:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Obtiene los workers disponibles.
 *
 * @async
 * @function getAvailableWorkers
 * @param {string} contractAddress - Dirección del contrato de calendario.
 * @param {number} [minHours] - Horas mínimas requeridas (opcional).
 * @returns {Promise<Array>} Lista de workers disponibles.
 */
exports.getAvailableWorkers = async (minHours) => {
    try {
        return await adapterAPI.getAvailableWorkers(minHours);
    } catch (error) {
        console.error(`[SEDA Calendar] Error getting available workers:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

/**
 * Obtiene la disponibilidad de todos los workers.
 *
 * @async
 * @function getAllWorkersAvailability
 * @param {string} contractAddress - Dirección del contrato de calendario.
 * @returns {Promise<Object>} Disponibilidad de todos los workers.
 */
exports.getAllWorkersAvailability = async () => {
    try {
        return await adapterAPI.getAllWorkersAvailability();
    } catch (error) {
        console.error(`[SEDA Calendar] Error getting all workers availability:`, error.message);
        throw error;
    }
};

//-----------------------------------------------------------

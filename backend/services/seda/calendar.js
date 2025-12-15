
const {adapterAPI} = require('../api-client');

// Esto desarparece con el siguiente api adapter
const calendarAddress = "Cfqrpkb3Fs17DBpQR5UmBq3bDzaDTnFe89RK9EwZvPWtJpr";

exports.calendarAddress = calendarAddress;

//-----------------------------------------------------------

/**
 * Devuelve los developers registrados en el calendar.
 */
exports.registeredWorkers = async () => {

    // Esto desarparece con el siguiente api adapter
    const calendarAddress = "Cfqrpkb3Fs17DBpQR5UmBq3bDzaDTnFe89RK9EwZvPWtJpr";

    const response = await adapterAPI.getRegisteredWorkers(calendarAddress);


    return response;
}

//-----------------------------------------------------------

/**
 * Devuelve la disponibilidad de los workers.
 */
exports.workersAvailability = async () => {

    const response = await adapterAPI.getAllWorkersAvailability(calendarAddress);

    return response;
}

//-----------------------------------------------------------

/**
 * Devuelve la address de un developer (worker) a partir de su email (userId).
 */
exports.getWorkerAddress = async (email) => {

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
        let response = await adapterAPI.registerWorker(calendarAddress, address, token);
        if (!response.success) {
            throw new Error("No puedo registrarme en el contrato Calendar.");
        }
    }
}

//-----------------------------------------------------------


/**
 * Guardar la disponibilidad de un worker.
 */
exports.setWorkerAvailability = async (userId, availability, token) => {

    // Obtener mi worker address:
    let address = await exports.getWorkerAddress(userId);
    if (!address) {
        throw new Error("No puedo obtener mi worker address.");
    }

     // Guardar disponibilidad en el Calendar
    // let response = await adapterAPI.adminSetWorkerAvailability(calendarAddress, address, availability, token);
    // if (!response.success) {
    //     throw new Error("No puedo guardar la disponibilidad de un worker en el contrato Calendar.");
    // }

    // Guardar disponibilidad en el Calendar
    let response = await adapterAPI.setAvailability(calendarAddress, availability, token);
    if (!response.success) {
        throw new Error("No puedo guardar la disponibilidad de un worker en el contrato Calendar.");
    }
}

//-----------------------------------------------------------

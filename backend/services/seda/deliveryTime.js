

const deliveryTimes = require('../../utils/deliveryTimes.json');


//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los tipos de hora de entrega (DeliveryTime) registrados.
 *
 * @async
 * @function deliveryTimeIndex
 * @returns {Object[]} Lista de horas de entrega en formato JSON.
 */
exports.deliveryTimeIndex = () => {

    return deliveryTimes.map((dt, index) => ({id: index, description: dt}));
}

//-----------------------------------------------------------

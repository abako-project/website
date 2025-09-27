

const json = require("./json");

const {
  models: {DeliveryTime}
} = require('../../models');


//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los tipos de hora de entrega (DeliveryTime) registrados.
 *
 * @async
 * @function deliveryTimeIndex
 * @returns {Promise<Object[]>} Lista de horas de entrega en formato JSON.
 */
exports.deliveryTimeIndex = async () => {

  const deliveryTimes = await DeliveryTime.findAll();

  return deliveryTimes.map(deliveryTime => json.deliveryTimeJson(deliveryTime));
}

//-----------------------------------------------------------

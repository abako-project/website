

const json = require("./json");

const {
  models: {Proficiency}
} = require('../../models');


//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los niveles de experiencia (Proficiency) registrados.
 *
 * @async
 * @function proficiencyIndex
 * @returns {Promise<Object[]>} Lista de niveles de experiencia en formato JSON.
 */
exports.proficiencyIndex = async () => {

  const proficiencies = await Proficiency.findAll();

  return proficiencies.map(proficiency => json.proficiencyJson(proficiency));
}

//-----------------------------------------------------------

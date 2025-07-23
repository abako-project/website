

const json = require("./json");

const {
  models: {Skill}
} = require('../../models');


//-----------------------------------------------------------

/**
 * Devuelve un listado de todas las habilidades (skills) registradas.
 *
 * @async
 * @function skillIndex
 * @returns {Promise<Object[]>} Lista de habilidades en formato JSON.
 */
exports.skillIndex = async () => {

  const skills = await Skill.findAll();

  return skills.map(skill => json.skillJson(skill));
}

//-----------------------------------------------------------

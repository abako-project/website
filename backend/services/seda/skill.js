

const json = require("./json");

const {
  models: {Skill}
} = require('../../models');


//-----------------------------------------------------------

// Devuelve un listado de todos los skills.
exports.skillIndex = async () => {

  const skills = await Skill.findAll();

  return skills.map(skill => json.skillJson(skill));
}

//-----------------------------------------------------------

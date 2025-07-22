
const json = require("./json");

const {
  models: {Language}
} = require('../../models');


//-----------------------------------------------------------

// Devuelve un listado de todos los lenguajes.
exports.languageIndex = async () => {

  const languages = await Language.findAll();

  return languages.map(language => json.languageJson(language));
}

//-----------------------------------------------------------

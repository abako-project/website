
const languajesData = require('../../utils/languages.json');

//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los lenguajes registrados.
 *
 * @async
 * @function languageIndex
 * @returns {Promise<Object[]>} Lista de lenguajes en formato JSON.
 */
exports.languageIndex = async () => {
    return Object.keys(languajesData).map((key, index) => ({id: index + 1, code: key, name: languajesData[key]}));
}

//-----------------------------------------------------------

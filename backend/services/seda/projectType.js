
const projectTypes = require('../../utils/projectTypes.json');



//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los tipos de proyecto (ProjectType) registrados.
 *
 * @async
 * @function projectTypeIndex
 * @returns {Promise<Object[]>} Lista de tipos de proyecto en formato JSON.
 */
exports.projectTypeIndex = async () => {

    return projectTypes.map((pt, index) => ({id: index, description: pt}));

}

//-----------------------------------------------------------

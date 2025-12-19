
const projectTypes = require('../../utils/projectTypes.json');



//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los tipos de proyecto (ProjectType) registrados.
 *
 * @async
 * @function projectTypeIndex
 * @returns {Object[]} Lista de tipos de proyecto en formato JSON.
 */
exports.projectTypeIndex = () => {

    return projectTypes.map((pt, index) => ({id: index, description: pt}));

}

//-----------------------------------------------------------

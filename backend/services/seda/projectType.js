

const json = require("./json");

const {
  models: {ProjectType}
} = require('../../models');


//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los tipos de proyecto (ProjectType) registrados.
 *
 * @async
 * @function projectTypeIndex
 * @returns {Promise<Object[]>} Lista de tipos de proyecto en formato JSON.
 */
exports.projectTypeIndex = async () => {

  const projectTypes = await ProjectType.findAll();

  return projectTypes.map(projectType => json.projectTypeJson(projectType));
}

//-----------------------------------------------------------

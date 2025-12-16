

const json = require("./json");

const {
  models: {Role, Comment}
} = require('../../models');




//-----------------------------------------------------------

/**
 * Devuelve los datos de un rol por su ID.
 *
 * @async
 * @function role
 * @param {number} roleId - ID del rol.
 * @returns {Promise<Object>} Objeto JSON con los datos del rol.
 * @throws {Error} Si no se encuentra el rol.
 */
exports.role = async roleId => {

  const role = await Role.findByPk(roleId);

  if (role) {
    return json.roleJson(role);
  } else {
    throw new Error('There is no role with id=' + roleId);
  }
};

//-----------------------------------------------------------

/**
 * Crea un nuevo rol.
 *
 * @async
 * @function roleCreate
 * @param {string} name - Nombre del nuevo rol.
 * @returns {Promise<Object>} Objeto JSON con los datos del rol creado.
 * @throws {Error} Si no se proporciona un nombre.
 */
exports.roleCreate = async (name) => {

  if (!name) {
    throw new Error('El campo name es obligatorio para crear un role.');
  }

  const role = await Role.create({name});

  return json.roleJson(role);
}

//-----------------------------------------------------------

/**
 * Actualiza el nombre de un rol.
 *
 * @async
 * @function roleUpdate
 * @param {number} roleId - ID del rol a actualizar.
 * @param {Object} data - Objeto con el nuevo nombre.
 * @param {string} data.name - Nuevo nombre del rol.
 * @returns {Promise<Object>} Objeto JSON con los datos actualizados del rol.
 */
exports.roleUpdate = async (roleId, {name}) => {

  let role = await Role.findByPk(roleId);

  role = await role.update({name});

  return json.roleJson(role);
};

//-----------------------------------------------------------

/**
 * Elimina un rol por su ID.
 *
 * @async
 * @function roleDestroy
 * @param {number} roleId - ID del rol a eliminar.
 * @returns {Promise<void>}
 */
exports.roleDestroy = async roleId => {
  await Role.destroy({where: {id: roleId}});
};

//-----------------------------------------------------------

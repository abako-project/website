

const json = require("./json");

const {
  models: {Role, Comment, Assignation}
} = require('../../models');


//-----------------------------------------------------------

// Devuelve un listado de todos los roles.
exports.roleIndex = async () => {

  const roles = await Role.findAll();

  return roles.map(role => json.roleJson(role));
}

//-----------------------------------------------------------

// Devuelve los datos de un role.
// Parametros:
//   * roleId: id del role
// Devuelve: un JSON con los datos del role,
exports.role = async roleId => {

  const role = await Role.findByPk(roleId);

  if (role) {
    return json.roleJson(role);
  } else {
    throw new Error('There is no role with id=' + roleId);
  }
};

//-----------------------------------------------------------

// Registrar un role nuevo.
// Parametros:
//    name:    nombre del role.
// Devuelve un JSON con los datos del role creado.
exports.roleCreate = async (name) => {

  if (!name) {
    throw new Error('El campo name es obligatorio para crear un role.');
  }

  const role = await Role.create({name});

  return json.roleJson(role);
}

//-----------------------------------------------------------

// Actualiza los datos de un role.
// Parametros:
//   * roleId: id del role
//   * name:    nombre del role.
// Devuelve un JSON con los datos actializados del role.
exports.roleUpdate = async (roleId, {name}) => {

  let role = await Role.findByPk(roleId);

  role = await role.update({name});

  return json.roleJson(role);
};

//-----------------------------------------------------------

// Borra un role.
// Parametros:
//   * roleId: id del role
// Devuelve: nada
exports.roleDestroy = async roleId => {
  await Role.destroy({where: {id: roleId}});
};

//-----------------------------------------------------------

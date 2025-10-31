const json = require('./json');

const {
  models: {User, Client, Developer, Role, Proficiency, Skill, Language},  
} = require('../../models');

/**
 * Busca un usuario por su ID, incluyendo cliente y desarrollador si existen.
 *
 * @async
 * @function userFindById
 * @param {number} userId - ID del usuario.
 * @returns {Promise<Object|null>} Objeto JSON con los datos del usuario o `null` si no existe.
 */
exports.userFindById = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [
      { model: Client, as: 'client' ,
        include: [
          { model: Language, as: 'languages' },
        ]
      },
      { model: Developer, as: 'developer',
        include: [
          { model: Role, as: 'role' },
          { model: Proficiency, as: 'proficiency' },
          { model: Skill, as: 'skills' },
          { model: Language, as: 'languages' }
        ]
      },
  ]});
  return user ? json.userJson(user) : null;
};

const {Sequelize, Op} = require("sequelize");

const json = require("./json");

const {
  models: {Attachment}
} = require('../../models');


//-----------------------------------------------------------

/**
 * Devuelve los datos de un attachment por su ID.
 *
 * @async
 * @function attachment
 * @param {number} attachmentId - ID del attachment.
 * @returns {Promise<Object>} Objeto JSON con los datos del attachment.
 * @throws {Error} Si no se encuentra el attachment con el ID especificado.
 */
exports.attachment = async attachmentId => {

  const attachment = await Attachment.findByPk(attachmentId);

  if (attachment) {
    return json.attachmentJson(attachment);
  } else {
    throw new Error('There is no attachment with id=' + attachmentId);
  }
};

//-----------------------------------------------------------

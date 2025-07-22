
const {Sequelize, Op} = require("sequelize");

const json = require("./json");

const {
  models: {Attachment}
} = require('../../models');


//-----------------------------------------------------------

// Devuelve los datos de un attachment.
// Parametros:
//   * attachmentId: id del attachment
// Devuelve: un JSON con los datos del attachment,
exports.attachment = async attachmentId => {

  const attachment = await Attachment.findByPk(attachment);

  if (attachment) {
    return json.attachmentJson(attachment);
  } else {
    throw new Error('There is no attachment with id=' + attachmentId);
  }
};

//-----------------------------------------------------------

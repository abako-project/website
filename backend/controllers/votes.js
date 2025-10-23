const seda = require("../services/seda");
// GET pantalla de votaciones
exports.viewVotes = async (req, res, next) => {

    res.render("votations/vote");
  
}
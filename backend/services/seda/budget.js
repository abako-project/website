

const json = require("./json");

const {
  models: {Budget}
} = require('../../models');


//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los presupuestos (budgets) registrados.
 *
 * @async
 * @function budgetIndex
 * @returns {Promise<Object[]>} Lista de budgets en formato JSON.
 */
exports.budgetIndex = async () => {

  const budgets = await Budget.findAll();

  return budgets.map(budget => json.budgetJson(budget));
}

//-----------------------------------------------------------

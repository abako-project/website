
const BudgetTypes = require('../../utils/budgets.json');

//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los presupuestos (budgets) registrados.
 *
 * @async
 * @function budgetIndex
 * @returns {Promise<Object[]>} Lista de budgets en formato JSON.
 */
exports.budgetIndex = async () => {
    return BudgetTypes.map((budget, index) => ({id: index, description: budget}));
}

//-----------------------------------------------------------

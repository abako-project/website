
const BudgetTypes = require('../enums/budgets.json');

//-----------------------------------------------------------

/**
 * Devuelve un listado de todos los presupuestos (budgets) registrados.
 *
 * @async
 * @function budgetIndex
 * @returns {Object[]} Lista de budgets en formato JSON.
 */
exports.budgetIndex = () => {
    return BudgetTypes.map((budget, index) => ({id: index, description: budget}));
}

//-----------------------------------------------------------

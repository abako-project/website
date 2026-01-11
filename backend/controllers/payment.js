
const seda = require("../services/seda");

// Listar todos los pagos del usuario loggueado.
// GET + /payments
exports.payments = async (req, res, next) => {

    try {
        if (req.session.loginUser.clientId) {

            const client = await seda.client(req.session.loginUser.clientId);

            const projects = await seda.projectsIndex(req.session.loginUser.clientId, null);

            // No se puede usar el valor client en las opciones cuando
            // hay llamadas anidadas a la funcion include de EJS.
            res.render('payments/index', {projects, c: client});

        } else if (req.session.loginUser.developerId) {

            const developer = await seda.developer(req.session.loginUser.developerId);

            const projects = await seda.projectsIndex(null, req.session.loginUser.developerId);

            // No se puede usar el valor client en las opciones cuando
            // hay llamadas anidadas a la funcion include de EJS.
            res.render('payments/index', {projects, c: null, developer, developer});

        } else {
            throw new Error("Estado imposible. Para consultar pagos hay que loguearse.");
        }
    } catch (error) {
        next(error);
    }
};

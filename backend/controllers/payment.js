
const seda = require("../models/seda");

const advancePaymentPercentage = 25;
exports.advancePaymentPercentage = advancePaymentPercentage;

// Listar todos los pagos del usuario loggueado.
// GET + /payments
exports.payments = async (req, res, next) => {

    try {
        if (req.session.loginUser.clientId) {

            const client = await seda.client(req.session.loginUser.clientId);

            const projects = await seda.projectsIndex(req.session.loginUser.clientId, null);

            projects.reverse();

            const allDeliveryTimes = await seda.deliveryTimeIndex();

            // No se puede usar el valor client en las opciones cuando
            // hay llamadas anidadas a la funcion include de EJS.
            res.render('payments/index', {projects, c: client, allDeliveryTimes, advancePaymentPercentage});

        } else if (req.session.loginUser.developerId) {

            const developer = await seda.developer(req.session.loginUser.developerId);

            const projects = await seda.projectsIndex(null, req.session.loginUser.developerId);

            projects.reverse();

            const allDeliveryTimes = await seda.deliveryTimeIndex();

            // No se puede usar el valor client en las opciones cuando
            // hay llamadas anidadas a la funcion include de EJS.
            res.render('payments/index', {projects, developer, allDeliveryTimes, advancePaymentPercentage});

        } else {
            throw new Error("Estado imposible. Para consultar pagos hay que loguearse.");
        }
    } catch (error) {
        next(error);
    }
};

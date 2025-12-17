
const seda = require("../../services/seda");

// --------- REGISTRO

exports.registerCreate = async (req, res, next) => {

    const {email, name, preparedData: json} = req.body;

    try {
        preparedData = JSON.parse(decodeURIComponent(json));
        await seda.clientCreate(email, name, preparedData);

        req.flash("success", '✅ Registrado correctamente');
        console.log("[Controlador clientes] Cliente registrado correctamente");

        res.redirect('/auth/login/client/new');
    } catch (error) {
        req.flash("error", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log("[Controlador clientes]", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/register/client/new');
    }
};



exports.loginCreate = async (req, res, next) => {

    const {email, token} = req.body;

    try {
        let rrrr = await seda.clientFindByEmail(email);
        console.log(">>>>>>>>>>>>>>>>>>", rrrr);
        let {id: clientId, name} = rrrr;

        // Guardar la zona horaria del navegador y del servidor en la session
        let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
        req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
        req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

        // Create req.session.loginUser.
        // The existence of req.session.loginUser indicates that the session exists.
        req.session.loginUser = {
            email,
            name,
            clientId,
            developerId: undefined,
            token
        };

        req.flash("success", 'Client authentication completed.');

        res.redirect(`/clients/${clientId}/projects`);

    } catch (error) {
        req.flash("error", 'Authentication has failed. Retry it again.');
        req.flash("error", `❌ Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/login/clients/new');
    }

};


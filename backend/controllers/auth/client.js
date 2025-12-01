
const seda = require("../../services/seda");

// --------- REGISTRO

exports.registerCreate = async (req, res, next) => {

    const {email, name, preparedData: json} = req.body;

    try {
        preparedData = JSON.parse(decodeURIComponent(json));
        await seda.clientCreate(email, name, preparedData);

        req.flash("success", '✅ Registrado correctamente');
        console.log("[Controlador clientes] Cliente registrado correctamente");

        //res.redirect('/clients/editProfile?email=' + encodeURIComponent(email) + '&name=' + encodeURIComponent(name));
        res.redirect('/auth/login/client/new');
    } catch (error) {
        req.flash("error", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log("[Controlador clientes]", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/register/client/new');
    }
};



exports.loginCreate = async (req, res, next) => {

    const {email, preparedData: json} = req.body;

    try {
        preparedData = JSON.parse(decodeURIComponent(json));

        console.log("======================================================");
        console.log("preparedData", JSON.stringify(preparedData, undefined, 2));
        console.log("======================================================");

        let {clientId, token, name} = await seda.clientConnect(email);

        // Guardar la zona horaria del navegador y del servidor en la session
        let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
        req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
        req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

        // Create req.session.loginUser.
        // The existence of req.session.loginUser indicates that the session exists.
        // I also save the moment when the session will expire due to inactivity.
        req.session.loginUser = {
            id: clientId,
            email: email,
            name: name,
            clientId: clientId,
            developerId: undefined,
            token
        };

        req.flash("success", 'Client authentication completed.');
        res.redirect(`/backdoor/clients`);
        //res.redirect(`/clients/${client.id}/projects`);

    } catch (error) {
        req.flash("error", 'Authentication has failed. Retry it again.');
        req.flash("error", `❌ Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/login/clients/new');
    }

};


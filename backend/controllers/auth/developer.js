
const seda = require("../../services/seda");

exports.registerCreate = async (req, res, next) => {

    const {email, name, preparedData: json} = req.body;

    try {
        preparedData = JSON.parse(decodeURIComponent(json));
        await seda.developerCreate(email, name, preparedData);

        req.flash("success", '✅ Registrado correctamente');
        console.log("[Controlador developers] Desarrollador Registrado correctamente");

        res.redirect('/auth/login/developer/new');
    } catch (error) {
        req.flash("error", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log("[Controlador developers]", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/register/developer/new');
    }
};


exports.loginCreate = async (req, res, next) => {

    const {email, preparedData: json} = req.body;

    try {
        preparedData = JSON.parse(decodeURIComponent(json));

        let {developerId, token, name} = await seda.developerConnect(email);

        // Guardar la zona horaria del navegador y del servidor en la session
        let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
        req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
        req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

        console.log("************ loginCreate");
        console.log({
            email: email,
            name: name,
            clientId: undefined,
            developerId: developerId,
            token
        });


        // Create req.session.loginUser.
        // The existence of req.session.loginUser indicates that the session exists.
        req.session.loginUser = {
            email: email,
            name: name,
            clientId: undefined,
            developerId: developerId,
            token
        };

        req.flash("success", 'Developer authentication completed.');
       // res.redirect(`/backdoor/developers`);
        res.redirect(`/developers/${developerId}/projects`);

    } catch (error) {
        req.flash("error", 'Authentication has failed. Retry it again.');
        req.flash("error", `❌ Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/login/developer/new');
    }
};


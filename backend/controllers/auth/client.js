
const seda = require("../../models/seda");
const languagesMap = require("../../models/enums/languages.json");
const allRoles = require("../../models/enums/roles.json");
const availabilityOptions = require("../../models/enums/availability.json");
const allSkills = require("../../models/enums/skills.json");
const allProficiencies = require("../../models/enums/proficiency.json");

// --------- REGISTRO


exports.registerNew = async (req, res, next) => {
    res.render('auth/register/clients/new', {layout: "layouts/layout"});
};


exports.registerCreate = async (req, res, next) => {

    const {email, name} = req.body;

    try {
        const {clientId} = await seda.clientCreate(email, name);
        req.flash("success", '✅ Registrado correctamente');
        console.log("[Controlador clientes] Cliente registrado correctamente");

        res.redirect(`/auth/register/client/${clientId}/profile/edit`);
    } catch (error) {
        req.flash("error", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log("[Controlador clientes]", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/register/client/new');
    }
};


exports.registerProfileEdit = async (req, res, next) => {

    const clientId = req.params.clientId;

    const client = await seda.client(clientId);

    const allLanguages = Object.entries(languagesMap).map(([code, name]) => ({code,name}));

    res.render('auth/register/clients/profile', {c: client, allLanguages, layout: "layouts/layout"});
};


exports.registerProfileUpdate = async (req, res, next) => {

    const clientId = req.params.clientId;

    const body = req.body;

    const email = body.email;
    const name = body.name;

    const token = body.token;

    let data = {
        email,
        name,
        company: body.company,
        department: body.department,
        website: body.website,
        description: body.description,
        location: body.location,
    };

    data.languages = Array.isArray(body.languages) ? body.languages : body.languages ? [body.languages] : ["none"];

    const image = req.file?.buffer || null;


    try {

        // Actualizar perfil:
        await seda.clientUpdate(clientId, data, image);

        console.log('Client profile created successfully.');

        res.redirect(`/auth/register/client/done`);

    } catch (error) {
        if (error instanceof seda.ValidationError) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));

            const allLanguages = Object.entries(languagesMap).map(([code, name]) => ({code, name}));

            res.render('auth/register/clients/profile', {clientId, clientEmail: data.email, allLanguages, layout: "layouts/layout"});

        } else {
            next(error);
        }
    }
};


exports.registerDone = async (req, res, next) => {

    res.render('auth/register/clients/done', { layout: "layouts/layout"});


}


// ----- LOGIN --------

exports.loginNew = async (req, res, next) => {
    res.render('auth/login/clients/login', {layout: "layouts/layout"});
};

exports.loginCreate = async (req, res, next) => {

    const {email, token} = req.body;

    try {
        let {id: clientId, name} = await seda.clientFindByEmail(email);

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
        console.log('Error: Authentication has failed. Retry it again.');
        req.flash("error", `❌ Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log(`❌ Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/login/client/new');
    }

};


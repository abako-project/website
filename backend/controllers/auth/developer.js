const seda = require("../../models/seda");

const languagesMap = require('../../models/enums/languages.json');
const allSkills = require('../../models/enums/skills.json');
const allRoles = require('../../models/enums/roles.json');
const availabilityOptions = require('../../models/enums/availability.json');
const allProficiencies = require('../../models/enums/proficiency.json');


// ----- REGISTER --------


exports.registerNew = async (req, res, next) => {
    res.render('auth/register/developers/new', {layout: "layouts/layout"});
};

exports.registerCreate = async (req, res, next) => {

    const {email, name, githubUsername, portfolioUrl} = req.body;

    const image = req.file?.buffer || null;

    try {
        const {developerId} = await seda.developerCreate(email, name, githubUsername, portfolioUrl, image);

        req.flash("success", '✅ Registrado correctamente');
        console.log("[Controlador developers] Desarrollador Registrado correctamente");

        res.redirect(`/auth/register/developer/${developerId}/profile/edit`);
    } catch (error) {
        req.flash("error", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.log("[Controlador developers]", `Registration error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/register/developer/new');
    }
};

exports.registerProfileEdit = async (req, res, next) => {

    const developerId = req.params.developerId;

    const developer = await seda.developer(developerId);

    const allLanguages = Object.entries(languagesMap).map(([code, name]) => ({code,name}));

    res.render('auth/register/developers/profile', {developer, allLanguages, allRoles, availabilityOptions, allSkills, allProficiencies, layout: "layouts/layout"});

};

exports.registerProfileUpdate = async (req, res, next) => {

    const developerId = req.params.developerId;

    const body = req.body;

    const email = body.email;
    const name = body.name;
    const githubUsername = body.githubUsername;

    const token = body.token;

    let data = {
        email,
        name,
        githubUsername,
        bio: body.bio,
        background: body.background,
        role: body.role,
        location: body.location,
        proficiency: body.proficiency,
    };

    data.skills = Array.isArray(body.skills) ? body.skills : body.skills ? [body.skills] : ["none"];
    data.languages = Array.isArray(body.languages) ? body.languages : body.languages ? [body.languages] : ["none"];

    if (!body.isAvailableForHire) {
        data.availability = "NotAvailable";
    } else {
        data.availability = body.availability;
        if (body.availability === "WeeklyHours") {
            data.availableHoursPerWeek = parseInt(body.availableHoursPerWeek || "0");
        }
    }

    try {
        // Registrar el worker en Calendar:
        await seda.registerWorker(email, token);

        // Configurar disponibilidad:
        await seda.setAvailability(data.availability, data.availableHoursPerWeek, token);

        // Actualizar perfil:
        await seda.developerUpdate(developerId, data);

        console.log('Developer profile created successfully.');

        res.redirect(`/auth/register/developer/done`);

    } catch (error) {
        if (error instanceof seda.ValidationError) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));

            const allLanguages = Object.entries(languagesMap).map(([code, name]) => ({code, name}));

            res.render('auth/register/developers/profile', {developerId, developerEmail: data.email, allLanguages, allRoles, availabilityOptions, allSkills, allProficiencies, layout: "layouts/layout"});

        } else {
            next(error);
        }
    }

};


exports.registerDone = async (req, res, next) => {

    res.render('auth/register/developers/done', { layout: "layouts/layout"});

}

// ----- LOGIN --------


exports.loginNew = async (req, res, next) => {
    res.render('auth/login/developers/new', {layout: "layouts/layout"});
};

exports.loginCreate = async (req, res, next) => {

    const {email, token} = req.body;

    try {
        let {id: developerId, name} = await seda.developerFindByEmail(email);

        // Guardar la zona horaria del navegador y del servidor en la session
        let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
        req.session.browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;
        req.session.serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

        // Create req.session.loginUser.
        // The existence of req.session.loginUser indicates that the session exists.
        req.session.loginUser = {
            email,
            name,
            clientId: undefined,
            developerId,
            token
        };

        req.flash("success", 'Developer authentication completed.');

        res.redirect(`/developers/${developerId}/projects`);
    } catch (error) {
        req.flash("error", 'Authentication has failed. Retry it again.');
        req.flash("error", `❌ Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        res.redirect('/auth/login/developer/new');
    }
};


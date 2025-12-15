"use strict";

const seda = require("../services/seda");
const {DataTypes} = require("sequelize");

// Autoload the developer with id equals to :developerId
exports.load = async (req, res, next, developerId) => {

  try {
    const developer = await seda.developer(developerId);

    req.load = {...req.load, developer};
    next();
  } catch (error) {
    next(error);
  }
};


exports.index = async (req, res, next) => {

  const developers = await seda.developerIndex();

  res.render('developers/index', {developers});
};

// GET /developers/:developerId/profile
exports.show = async (req, res, next) => {
    try {
        const {developer} = req.load;

        const avatarUrl = `/developers/${developer.id}/attachment`;

        const votes = await seda.votesFindByUser(developer.id);
        const numberOfVotes = votes.length;
        const avgRating = votes.length ? Math.ceil((votes.reduce((sum, v) => sum + v.score, 0) / votes.length)) : null;

        const lastTwo = votes.slice(0, 4);
        const lastVotes = []; // Últimos 2 votos

        for (const v of lastTwo) {
            const user = await seda.userFindById(v.fromUserId);
            if (!user) continue;

            const isDev = !!user.developer;
            const isCli = !!user.client;

            const profile = user.developer || user.client;
            const name = profile?.name || user.email;
            const role = isDev ? (profile.role?.name || "Developer") : (isCli ? "Client" : "Unknown");
            const prof = isDev ? (profile.proficiency?.description || "") : "";
            const avatar =
                isDev
                    ? `/developers/${profile.id}/attachment`
                    : isCli
                        ? `/clients/${profile.id}/attachment`
                        : "/images/none.png";

            lastVotes.push({
                score: v.score,
                fromUserId: v.fromUserId,
                fromUserName: name,
                fromUserRole: role,
                fromUserProf: prof,
                fromUserAvatarUrl: avatar
            });
        }

        res.render('developers/profile/show', {developer, avatarUrl, avgRating, lastVotes, numberOfVotes});
    } catch (error) {
        next(error);
    }
};


// GET /developers/:developerId/profile/edit
exports.edit = async (req, res, next) => {

  const {developer} = req.load;

  const allLanguages = await seda.languageIndex();
  const allRoles = await seda.roleIndex();
  const allProficiencies = await seda.proficiencyIndex();
  const allSkills = await seda.skillIndex();

  res.render('developers/profile/edit', {developer, allLanguages, allRoles, allProficiencies, allSkills});
};


// PUT /developers/:developerId
exports.update = async (req, res, next) => {

    const {body} = req;

    const developerId = req.params.developerId;

    const {developer} = req.load;

    // FALTA POR REFINAR CON LO QUE SOPORTE EL BACK
    let data = {
        name: body.name,
        githubUsername: body.githubUsername,
        portfolioUrl: body.portfolioUrl,
        bio: body.bio  || "",
        background: body.background  || "",
        proficiency: body.proficiency  || "junior",
        role: body.role || "junior",
        location: body.location  || "",
        availability: body.availability || "NotAvailable",
        languages: (body.languages || ["ESP"]),
        skills: (body.skills || ["Node"]),
        availableHoursPerWeek: body.availableHoursPerWeek || 0,
    };

    if (req.file) {
        data.mime = req.file?.mimetype;
        data.image = req.file?.buffer;
    }

    let data_ignorados = {
        isAvailableForHire: !!body.isAvailableForHire,
        isAvailableFullTime: !!body.isAvailableFullTime,
        isAvailablePartTime: !!body.isAvailablePartTime,
        isAvailableHourly: !!body.isAvailableHourly,
    };

        try {
        // Registrar el worker en Calendar:
        await seda.registerWorker(developer.email, req.session.loginUser.token);

        // Configurar disponibilidad:
        await seda.setWorkerAvailability(developer.email, "FullTime", req.session.loginUser.token);

        // Actualizar perfil:
        await seda.developerUpdate(developerId, data);

        console.log('Developer edited successfully.');

        res.redirect('/developers/' + developerId + '/profile');
    } catch (error) {
        if (error instanceof seda.ValidationError) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));

            const allLanguages = await seda.languageIndex();
            const allRoles = await seda.roleIndex();
            const allProficiencies = await seda.proficiencyIndex();
            const allSkills = await seda.skillIndex();

            res.render('developers/profile/edit', {developer, allLanguages, allRoles, allProficiencies, allSkills});

        } else {
            next(error);
        }
    }
};


// GET /developers/:developerId/attachment
exports.attachment = async (req, res, next) => {

  try {
    const developerId = req.params.developerId;

    const attachment = await seda.developerAttachment(developerId);

    if (!attachment) {
      res.redirect("/images/none.png");
    } else {
      res.type(attachment.mime);
      res.send(attachment.image);
    }
  } catch (error) {
    next(error);
  }
};


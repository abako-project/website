"use strict";

const seda = require("../services/seda");
const {DataTypes} = require("sequelize");

const languagesMap = require('../utils/languages.json');
const allSkills = require('../utils/skills.json');
const allRoles = require('../utils/roles.json');
const availabilityOptions = require('../utils/availability.json');
const allProficiencies = require('../utils/proficiency.json');

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
    const languageNames = developer.languages?.map(code => languagesMap[code]) || [];

    //LAS VOTACIONES NO ESTAN IMPLEMENTADAS POR VIRTO
    // const votes = await seda.votesFindByUser(developer.id);
    // const numberOfVotes = votes.length;
    // const avgRating = votes.length ? Math.ceil((votes.reduce((sum, v) => sum + v.score, 0)/ votes.length)): null;

    // const lastTwo = votes.slice(0, 4);
    // const lastVotes = []; // Últimos 2 votos
    
    // for (const v of lastTwo) {
    //   const user = await seda.userFindById(v.fromUserId);
    //   if (!user) continue;

    //   const isDev = !!user.developer;
    //   const isCli = !!user.client;

    //   const profile = user.developer || user.client;
    //   const name = profile?.name || user.email;
    //   const role = isDev ? (profile.role?.name || "Developer") : (isCli ? "Client" : "Unknown");
    //   const prof = isDev ? (profile.proficiency?.description || "") : "";
    //   const avatar =
    //     isDev
    //       ? `/developers/${profile.id}/attachment`
    //       : isCli
    //       ? `/clients/${profile.id}/attachment`
    //       : "/images/none.png";

    //   lastVotes.push({
    //     score: v.score,
    //     fromUserId: v.fromUserId,
    //     fromUserName: name,
    //     fromUserRole: role,
    //     fromUserProf: prof,
    //     fromUserAvatarUrl: avatar
    //     });
    // }
    //res.render('developers/profile/show', {developer, avatarUrl, avgRating, lastVotes, numberOfVotes});

    res.render('developers/profile/show', {developer, avatarUrl, languageNames});

  } catch (error) {
    next(error);
  }
};


// GET /developers/:developerId/profile/edit
exports.edit = async (req, res, next) => {
  try {
    const {developer} = req.load;

    const allLanguages = Object.entries(languagesMap).map(([code, name]) => ({code,name}));

    res.render('developers/profile/edit', {developer, allLanguages, allRoles, availabilityOptions, allSkills, allProficiencies});
  } catch (err) {
    next(err);
  }
};


// PUT /developers/:developerId
exports.update = async (req, res, next) => {
  const developerId = req.params.developerId;
  const {developer} = req.load;
  const body = req.body;

  console.log(">>>> BODY >>>>>>", body);


    // FALTA POR REFINAR CON LO QUE SOPORTE EL BACK
    let data = {
        name: body.name,
        githubUsername: body.githubUsername,
        portfolioUrl: body.portfolioUrl,
        bio: body.bio,
        background: body.background,
        role: body.role || null,
        location: body.location,
        proficiency: body.proficiency || null,
  };

    // data.skills = Array.isArray(body.skills) ? body.skills : body.skills ? [body.skills] : [];
    data.skills = Array.isArray(body.skills) ? body.skills : body.skills ? [body.skills] : ["none"];
    // data.languages = Array.isArray(body.languages) ? body.languages : body.languages ? [body.languages] : [];
    data.languages = Array.isArray(body.languages) ? body.languages : body.languages ? [body.languages] : ["none"];

  if (!body.isAvailableForHire) {
      data.availability = "NotAvailable";
    } else {
      data.availability = body.availability;
      if (body.availability === "WeeklyHours") {
        data.availableHoursPerWeek = parseInt(body.availableHoursPerWeek || "0");
      }
    }

    const image = req.file?.buffer || null;


    try {
        // Registrar el worker en Calendar:
        await seda.registerWorker(developer.email, req.session.loginUser.token);

        // Configurar disponibilidad:
        await seda.setAvailability(data.availability, req.session.loginUser.token);

        // Actualizar perfil:
        await seda.developerUpdate(developerId, data, image);

        console.log('Developer edited successfully.');
        res.redirect(`/developers/${developerId}/profile`);

    } catch (error) {
        if (error instanceof seda.ValidationError) {
            console.log('There are errors in the form:');
            error.errors.forEach(({message}) => console.log(message));

            const allLanguages = Object.entries(languagesMap).map(([code, name]) => ({code, name}));
            res.render('developers/profile/edit', {developer, allLanguages, allRoles, availabilityOptions, allSkills});

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

    if (!attachment || !attachment.image) {
      return res.redirect("/images/none.png");
    }
    res.type(attachment.mime);
    res.send(Buffer.from(attachment.image));

  } catch (error) {
    next(error);
  }
};


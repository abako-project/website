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

    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
    console.log(developers)
    console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")

  res.render('developers/index', {developers});
};

// GET /developers/:developerId/profile
exports.show = async (req, res, next) => {
  try {
    const {developer} = req.load;
    const avatarUrl = `/developers/${developer.id}/attachment`;
    const votes = await seda.votesFindByUser(developer.user.id);
    const numberOfVotes = votes.length; 
    const avgRating = votes.length ? Math.ceil((votes.reduce((sum, v) => sum + v.score, 0)/ votes.length)): null;

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


// GET /developers/editProfile?email=email&name=name
exports.editProfile = async (req, res, next) => {
    try {

        const {email, name} = req.query;

        const developer = await seda.developerFindByEmail(email);

        const allLanguages = await seda.languageIndex();
        const allRoles = await seda.roleIndex();
        const allProficiencies = await seda.proficiencyIndex();
        const allSkills = await seda.skillIndex();

        res.render('developers/profile/edit', {developer, allLanguages, allRoles, allProficiencies, allSkills});
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

  let developer = {
    name: body.name,
    bio: body.bio,
    background: body.background,
    roleId: body.roleId || null,
    proficiencyId: body.proficiencyId || null,
    githubUsername: body.githubUsername,
    portfolioUrl: body.portfolioUrl,
    location: body.location,
    availability: body.availability,
    languageIds: (body.languages || []).map(str => +str),
    skillIds: (body.skills|| []).map(str => +str),
    isAvailableForHire: !!body.isAvailableForHire,
    isAvailableFullTime: !!body.isAvailableFullTime,
    isAvailablePartTime: !!body.isAvailablePartTime,
    isAvailableHourly: !!body.isAvailableHourly,
    availableHoursPerWeek: body.availableHoursPerWeek,
    mime: req.file?.mimetype,
    image: req.file?.buffer
  };

  try {
    await seda.developerUpdate(developerId, developer);

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


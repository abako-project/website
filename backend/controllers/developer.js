"use strict";

const seda = require("../services/seda");

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


// GET /developers/:developerId/edit
exports.edit = async (req, res, next) => {

  const {developer} = req.load;

  const allLanguages = await seda.languageIndex();
  const allRoles = await seda.roleIndex();
  const allProficiencies = await seda.proficiencyIndex();
  const allSkills = await seda.skillIndex();

  res.render('developers/edit', {developer, allLanguages, allRoles, allProficiencies, allSkills});
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
    skillIds: body.skills.map(str => +str),
    mime: req.file?.mimetype,
    image: req.file?.buffer
  };

  try {
    await seda.developerUpdate(developerId, developer);

    console.log('Developer edited successfully.');

    res.redirect('/');
  } catch (error) {
    if (error instanceof seda.ValidationError) {
      console.log('There are errors in the form:');
      error.errors.forEach(({message}) => console.log(message));

      const allLanguages = await seda.languageIndex();
      const allRoles = await seda.roleIndex();
      const allProficiencies = await seda.proficiencyIndex();
      const allSkills = await seda.skillIndex();

      res.render('developers/edit', {developer, allLanguages, allRoles, allProficiencies, allSkills});

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


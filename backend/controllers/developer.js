"use strict";

const createError = require('http-errors');
const Sequelize = require("sequelize");

const {models: {User, Developer, Attachment, Language, Skill, Role}} = require('../models');

// Autoload the developer with id equals to :developerId
exports.load = async (req, res, next, developerId) => {

  try {
    const developer = await Developer.findByPk(developerId, {
      include: [
        {model: User, as: "user"},
        {model: Attachment, as: "attachment"},
        {model: Language, as: "languages"},
        {model: Skill, as: "skills"},
      ]
    });
    if (developer) {
      req.load = {...req.load, developer};
      next();
    } else {
      req.flash('error', 'There is no developer with id=' + developerId + '.');
      throw createError(404, 'No exist developerId=' + developerId);
    }
  } catch (error) {
    next(error);
  }
};

exports.index = async (req, res, next) => {

  const developers = await Developer.findAll({
    include: [
      {model: User, as: "user"},
      {model: Attachment, as: "attachment"},
      {model: Language, as: "languages"},
      {model: Role, as: "role"},
      {model: Skill, as: "skills"},
    ]
  });

  res.render('developers/index', {developers});
};


// GET /developers/:developerId/edit
exports.edit = async (req, res, next) => {

  const {developer} = req.load;

  const allLanguages = await Language.findAll();
  const allRoles = await Role.findAll();
  const allSkills = await Skill.findAll();

  res.render('developers/edit', {developer, allLanguages, allRoles, allSkills});
};


// PUT /developers/:developerId
exports.update = async (req, res, next) => {

  const {body} = req;
  let {developer} = req.load;

  developer.name = body.name;
  developer.bio = body.bio;
  developer.background = body.background;
  developer.roleId = body.roleId || null;
  developer.experienceLevel = body.experienceLevel;
  developer.githubUsername = body.githubUsername;
  developer.portfolioUrl = body.portfolioUrl;
  developer.city = body.city;
  developer.country = body.country;
  developer.availability = body.availability;


  let fields_to_update = ["name", "bio", "background", "roleId", "experienceLevel",
    "githubUsername", "portfolioUrl", "city", "country", "availability"];

  try {
    developer = await developer.save({fields: fields_to_update});

    console.log('Developer edited successfully.');

    try {
      await developer.setLanguages(body.languages.map(str => +str));
    } catch (error) {
      console.log('Failed setting languages: ' + error.message);
    }


    try {
      await developer.setSkills(body.skills.map(str => +str));
    } catch (error) {
      console.log('Failed setting skills: ' + error.message);
    }

    try {
      if (!req.file) {
        console.log('Developer attachment does not change.');
        return;
      }
      // Delete old attachment.  // Repasar CASCADE
      if (developer.attachment) {
        await developer.attachment.destroy();
      }

      // Create the new developer attachment
      const attachment = await Attachment.create({
        mime: req.file.mimetype,
        image: req.file.buffer
      });
      await developer.setAttachment(attachment);
      console.log('Attachment saved successfully.');

    } catch (error) {
      console.log('Failed saving the new attachment: ' + error.message);
    } finally {
      res.redirect('/');
    }
  } catch (error) {
    if (error instanceof Sequelize.ValidationError) {
      console.log('There are errors in the form:');
      error.errors.forEach(({message}) => console.log(message));
      res.render('clients/edit', {client});
    } else {
      next(error);
    }
  }
};


// GET /developers/:developerId/attachment
exports.attachment = (req, res, next) => {

  const {developer: {attachment}} = req.load;

  if (!attachment) {
    res.redirect("/images/none.png");
  } else {
    res.type(attachment.mime);
    res.send(attachment.image);
  }
}


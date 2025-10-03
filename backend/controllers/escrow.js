
const seda = require("../services/seda");


// Escrow
exports.escrow = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  res.render('escrow/escrow', {
    project
  });
};

// Empieza el projecto despues de provisionar los fondos
exports.startProject = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  await seda.projectStart(projectId);

  res.redirect('/projects/' + project.id);

};


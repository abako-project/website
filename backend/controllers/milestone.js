
const seda = require("../services/seda");



// Listar todos los milestones o los de un cliente o los de un developer
// GET + /milestones
// GET + /clients/:clientId/milestones
// GET + /developers/:developerId/milestones
exports.milestones = async (req, res, next) => {

  try {

    const clientId = req.params.clientId;
    const client = clientId ? await seda.client(clientId) : null;

    const developerId = req.params.developerId;
    const developer = developerId ? await seda.developer(developerId) : null;

    const projects = await seda.projectsIndex(clientId, developerId, developerId);

    // No se puede usar el valor client en las opciones cuando
    // hay llamadas anidadas a la funcion include de EJS.
    res.render('dashboard/milestones', {projects, c: client, developer});
  } catch (error) {
    next(error);
  }
};


// Editar todos los milestones de un proyecto
exports.editAll = async (req, res, next) => {

  try {
    const projectId = req.params.projectId;
    const project = await seda.project(projectId);

    res.render('milestones/editMilestones', {project});
  } catch (error) {
    next(error);
  }
};

// Mostrar formulario de creación de un milestone
exports.new = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const milestone = {
    title: "",
    description: "",
    budget: "",
    deliveryDate: Date.now() + 60 * 60 * 1000
  };

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;

  res.render('milestones/newMilestone', {
    milestone,
    project,
    browserTimezoneOffset,
  });
};



// Crear milestone
exports.create = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  let {title, description, budget, deliveryDate} = req.body;

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  deliveryDate = new Date(deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset;

  let milestone = {
    title,
    description,
    budget,
    deliveryDate
  };

  try {
    await seda.milestoneCreate(projectId, milestone);

    console.log('Success: Milestone created successfully.');
    res.redirect('/projects/' + projectId + '/milestones/edit');
  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('milestones/newMilestone', {
        milestone,
        project,
        browserTimezoneOffset,
      });
    } else {
      next(error);
    }
  }
};


// Mostrar formulario de edición
exports.edit = async (req, res) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const milestoneId = req.params.milestoneId;
  const milestone = await seda.milestone(milestoneId);

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;

  res.render('milestones/editMilestone', {
    project,
    milestone,
    browserTimezoneOffset,
  });
};


// Actualizar milestone
exports.update = async (req, res) => {

  const {body} = req;

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const milestoneId = req.params.milestoneId;
  const milestone = await seda.milestone(milestoneId);

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  milestone.title = body.title;
  milestone.description = body.description;
  milestone.budget = body.budget;
  milestone.deliveryDate = new Date(body.deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset;

  try {
    await seda.milestoneUpdate(milestone.id, milestone);

    // await milestone.save();
    console.log('Milestone edited successfully.');
    res.redirect('/projects/' + project.id + '/milestones/edit');
  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('milestones/editMilestone', {
        project,
        milestone,
        browserTimezoneOffset,
      });
    } else {
      next(error);
    }
  }
};


// Eliminar milestone
exports.destroy = async (req, res, next) => {

  const projectId = req.params.projectId;

  const milestoneId = req.params.milestoneId;

  try {
    await seda.milestoneDestroy(milestoneId);

    console.log('Milestone deleted successfully.');
    res.redirect('/projects/' + projectId + '/milestones/edit');
  } catch (error) {
    next(error);
  }
};


// Intercambiar el orden de visualizacion de 2 milestones
exports.swapOrder = async (req, res, next) => {

  try {
    const milestone1 = await seda.milestone(req.params.id1);

    await seda.milestonesSwapOrder(req.params.id1, req.params.id2);

    console.log('Milestones swapped successfully.');
    res.redirect('/projects/' + milestone1.projectId + '/milestones/edit');
  } catch(error) {
    next(error);
  }
};


// Mostrar formulario para seleccioanr el developer de un milestone
exports.selectDeveloper = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const milestoneId = req.params.milestoneId;
  const milestone = await seda.milestone(milestoneId);

  try {
    const validDevelopers = await seda.developersWithRole(milestone.roleId);

    res.render('milestones/selectDeveloper', {
      project,
      milestone,
      validDevelopers
    });
  } catch (error) {
    next(error);
  }
}

// Actualizar el developer de un milestone
exports.setDeveloper = async (req, res, next) => {

  const {body} = req;

  const projectId = req.params.projectId;
  const milestoneId = req.params.milestoneId;

  try {
    await seda.milestoneSetDeveloper(milestoneId, body.developerId);

    console.log('Milestone developer assigned successfully.');

    res.redirect('/projects/' + projectId);

  } catch (error) {
    next(error);
  }
}


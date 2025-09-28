
const seda = require("../services/seda");


// Listar todos los proyectos o los de un cliente o los de un developer
// GET + /projects
// GET + /clients/:clientId/projects
// GET + /developers/:developerId/projects
exports.index = async (req, res, next) => {

  try {

    const clientId = req.params.clientId;
    const client = clientId ? await seda.client(clientId) : null;

    const developerId = req.params.developerId;
    const developer = developerId ? await seda.developer(developerId) : null;

    const projects = await seda.projectsIndex(clientId, developerId, developerId);

    // No se puede usar el valor client en las opciones cuando
    // hay llamadas anidadas a la funcion include de EJS.
    res.render('projects/index', {projects, c: client, developer});
  } catch (error) {
    next(error);
  }
};


// Mostrar formulario de creación
exports.newProposal = (req, res, next) => {

  const project = {
    title: "",
    summary: "",
    description: "",
    url: "",
    budget: "",
    currency: "",
    deliveryDate: Date.now() + 60 * 60 * 1000
  };

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;

  res.render('projects/proposals/newProposal', {
    project,
    browserTimezoneOffset,
  });
};

// Crear proyecto
exports.createProposal = async (req, res, next) => {

  let {title, summary, description, url, budget, currency, deliveryDate} = req.body;

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  deliveryDate = new Date(deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset;

  const clientId = req.session.loginUser?.clientId;

  let proposal = {
    title,
    summary,
    description,
    url,
    budget,
    currency,
    deliveryDate
  };

  try {
    // Save into the data base
    let project = await seda.proposalCreate(clientId, proposal);
    console.log('Success: Project created successfully.');

    // res.redirect('/clients/' + req.session.loginUser.clientId + '/projects');
    res.redirect('/projects/' + project.id + '/objectives_constraints/edit');

  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('projects/proposals/newProposal', {
        proposal,
        browserTimezoneOffset,
      });
    } else {
      next(error);
    }
  }

};

// Mostrar detalle de un proyecto
exports.show = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;

  if (project.state) {
    res.render('projects/overview', {
      project,
      browserTimezoneOffset,
    });
  } else {
    res.render('projects/show', {
      project,
      browserTimezoneOffset,
    });
  }
};


// Mostrar formulario de edición
exports.editProposal = async (req, res, next) => {

  try {
    const projectId = req.params.projectId;
    const project = await seda.project(projectId);

    // Timezone offset del cliente
    let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
    browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;


    res.render('projects/editProposal', {
      project,
      browserTimezoneOffset,
    });
  } catch (error) {
    next(error);
  }
};


// Actualizar proyecto
exports.updateProposal = async (req, res, next) => {

  const {body} = req;

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  const proposal = {
    title: body.title,
    summary: body.summary,
    description: body.description,
    url: body.url,
    budget: body.budget,
    currency: body.currency,
    deliveryDate: new Date(body.deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset
  };

  try {
    await seda.proposalUpdate(project.id, proposal);

    console.log('Project edited successfully.');

    res.redirect('/projects/' + project.id + '/objectives_constraints/edit');

  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('projects/editProposal', {
        project,
        browserTimezoneOffset,
      });
    } else {
      next(error);
    }
  }
};

// Eliminar proyecto
exports.destroy = async (req, res, next) => {

  const projectId = req.params.projectId;

  try {
    await seda.projectDestroy(projectId);

    // project.destroy();
    console.log('Project deleted successfully.');
    res.redirect('/projects');
  } catch (error) {
    next(error);
  }
};


// Publicar el proyecto: estado = pending
exports.projectSubmit = async (req, res, next) => {

  const projectId = req.params.projectId;

  const clientId = req.session.loginUser?.clientId;

  try {
    // Save into the data base
    await seda.projectSubmit(projectId);

    console.log('Success: Project submitted successfully.');

    if (clientId) {
      res.redirect('/clients/' + clientId + '/projects');
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// Publicar el scope: estado = validationNeeded
exports.scopeSubmit = async (req, res, next) => {

  const projectId = req.params.projectId;

  const developerId = req.session.loginUser?.developerId;

  const consultantComment = req.body.consultantComment || "";

  try {
    await seda.scopeSubmit(projectId, consultantComment)

    console.log('Success: Scope submitted successfully.');

    if (developerId) {
      res.redirect('/projects/' + projectId);
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// Aceptar el scope: estado = taskingInProgress
exports.scopeAccept = async (req, res, next) => {

  const projectId = req.params.projectId;

  const clientId = req.session.loginUser?.clientId;

  const clientResponse = req.body.clientResponse || "Genial no, lo siguiente."

  try {
    await seda.scopeAccept(projectId, clientResponse);

    console.log('Success: Scope accepted successfully.');

    if (clientId) {
      res.redirect('/projects/' + projectId);
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// Rechazar el scope: estado = scopingInProgress
exports.scopeReject = async (req, res, next) => {

  const projectId = req.params.projectId;

  const clientId = req.session.loginUser?.clientId;

  const clientResponse = req.body.clientResponse || "Peor imposible."

  try {
    await seda.scopeReject(projectId, clientResponse);

    console.log('Success: Scope rechazados successfully.');

    if (clientId) {
      res.redirect('/projects/' + projectId);
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};

// Rechazar el proyecto: estado = rejected
exports.reject = async (req, res, next) => {

  const projectId = req.params.projectId;

  try {
    await seda.projectReject(projectId);

    console.log('Success: Project rejected successfully.');
    res.redirect('/projects/' + projectId);
  } catch (error) {
    next(error);
  }
};


// Aprobar el proyecto: estado = rejected
exports.approve = async (req, res, next) => {

  const projectId = req.params.projectId;

  try {
    await seda.projectApprove(projectId);

    console.log('Success: Project approved successfully.');
    res.redirect('/projects/' + projectId);
  } catch (error) {
    next(error);
  }
};


// Mostrar Formulario para editar objectives y Constraints
exports.editObjectivesConstraints = async (req, res) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;


  res.render('projects/proposals/editObjectivesConstraints', {
    project,
    browserTimezoneOffset,
  });
};


// Mostrar formulario para seleccioanr consultor
exports.selectConsultant = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  try {
    const allDevelopers = await seda.developerIndex();

    res.render('consultants/select', {
      project,
      allDevelopers
    });
  } catch (error) {
    next(error);
  }
};


// Actualizar consultor del proyecto
exports.setConsultant = async (req, res, next) => {

  const {body} = req;

  const projectId = req.params.projectId;

  const consultantId = body.consultantId;

  try {
    await seda.projectSetConsultant(projectId, consultantId);

    console.log('Project consultant assigned successfully.');

    res.redirect('/projects/' + projectId);

  } catch (error) {
    next(error);
  }
};

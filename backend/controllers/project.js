
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

      // console.log("....... Ctrl + projec + index.......................");
      // console.log(JSON.stringify(projects, undefined, 2));
      // console.log("..............................");
//

    // No se puede usar el valor client en las opciones cuando
    // hay llamadas anidadas a la funcion include de EJS.
    res.render('dashboard/projects', {projects, c: client, developer});
  } catch (error) {
    next(error);
  }
};


// Mostrar formulario de creación
exports.newProposal = async (req, res, next) => {

  try {
    const project = {
      title: "",
      summary: "",
      description: "",
      url: "",
      projectTypeId: undefined,
      budgetId: undefined,
      deliveryTimeId: 4,
      deliveryDate: Date.now()
    };

    const allBudgets = await seda.budgetIndex();
    const allDeliveryTimes = await seda.deliveryTimeIndex();
    const allProjectTypes = await seda.projectTypeIndex();

    res.render('proposals/newProposal', {
      project,
      allBudgets,
      allDeliveryTimes,
      allProjectTypes,
    });
  } catch (error) {
    next(error);
  }
};

// Crear proyecto
exports.createProposal = async (req, res, next) => {

  let {title, summary, description, url, projectType, budget, deliveryTime, deliveryDate} = req.body;

  deliveryDate = new Date(deliveryDate).valueOf() + req.session.browserTimezoneOffset - req.session.serverTimezoneOffset;

  const clientId = req.session.loginUser?.clientId;

  let proposal = {
    title,
    summary,
    description,
    url,
    projectType,
    budget,
    deliveryTime,
    deliveryDate
  };

    try {
    // Save into the data base
    let projectId = await seda.proposalCreate(clientId, proposal, req.session.loginUser.token);
    console.log('Success: Project created successfully.');

    // res.redirect('/clients/' + req.session.loginUser.clientId + '/projects');
      //  res.redirect('/projects/' + projectId + '/objectives_constraints/edit');
        res.redirect('/projects/' + projectId);

  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      const allBudgets = await seda.budgetIndex();
      const allDeliveryTimes = await seda.deliveryTimeIndex();
      const allProjectTypes = await seda.projectTypeIndex();

      res.render('proposals/newProposal', {
        proposal,
        allBudgets,
        allDeliveryTimes,
        allProjectTypes,
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


    console.log(">>> ctrl.project.show");
    console.log(project);
    console.log("-----------------------------");

    res.render('projects/showProject', {
      project,
    });
};

// Mostrar la pantalla para ofrecer hacer un submit de la propuesta
exports.submit = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  res.render('proposals/submitProposal', {
    project,
  });
};

// Mostrar formulario de edición
exports.editProposal = async (req, res, next) => {

  try {
    const projectId = req.params.projectId;
    const project = await seda.project(projectId);

    const allBudgets = await seda.budgetIndex();
    const allDeliveryTimes = await seda.deliveryTimeIndex();
    const allProjectTypes = await seda.projectTypeIndex();

    res.render('proposals/editProposal', {
      project,
      allBudgets,
      allDeliveryTimes,
      allProjectTypes,
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

  const proposal = {
    title: body.title,
    summary: body.summary,
    description: body.description,
    url: body.url,
    projectType: body.projectType || undefined,
    budget: body.budget,
    deliveryTime: body.deliveryTime,
    deliveryDate: new Date(body.deliveryDate).valueOf() + req.session.browserTimezoneOffset - req.session.serverTimezoneOffset
  };

  try {
    await seda.proposalUpdate(project.id, proposal, req.session.loginUser.token);

    console.log('Project edited successfully.');

    //res.redirect('/projects/' + project.id + '/objectives_constraints/edit');
      res.redirect('/projects/' + projectId);

  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      const allBudgets = await seda.budgetIndex();
      const allDeliveryTimes = await seda.deliveryTimeIndex();
      const allProjectTypes = await seda.projectTypeIndex();

      res.render('proposals/editProposal', {
        project,
        allBudgets,
        allDeliveryTimes,
        allProjectTypes,
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


// Publicar la propuesta: estado = ProposalPending
exports.proposalSubmit = async (req, res, next) => {

  const projectId = req.params.projectId;

  const clientId = req.session.loginUser?.clientId;

  try {
    // Save into the data base
    await seda.proposalSubmit(projectId);

    console.log('Success: Project submitted successfully.');

    req.flash("info", "Project submitted successfully. You will be notified al soon as the project gets reviewed.");

    if (clientId) {
      res.redirect('/clients/' + clientId + '/projects');
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// El consultor publicar el scope:
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


// El cliente acepta el scope (milestones):
// Estamos en el estado ScopeValidationNeeded y
// pasamos al estado EscrowFundingNeeded.
exports.scopeAccept = async (req, res, next) => {

  const projectId = req.params.projectId;

  const clientId = req.session.loginUser?.clientId;

  const clientResponse = req.body.clientResponse || "Genial no, lo siguiente."

  try {
    await seda.scopeAccept(projectId, clientResponse);

    console.log('Success: Scope accepted successfully.');

    if (clientId) {
      res.redirect('/projects/' + projectId + '/escrow');
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};


// Rechazar el scope: estado = ScopingInProgress
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

// Rechazar el proyecto:
exports.rejectProposal = async (req, res, next) => {

  const projectId = req.params.projectId;

    const proposalRejectionReason = req.body.proposalRejectionReason || ""

    try {
    await seda.rejectProposal(projectId, proposalRejectionReason);

    console.log('Success: Project rejected successfully.');
    res.redirect('/projects/' + projectId);
  } catch (error) {
    next(error);
  }
};


// Aprobar el proyecto:
exports.approveProposal = async (req, res, next) => {

  const projectId = req.params.projectId;

  try {
    await seda.approveProposal(projectId);

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

  res.render('proposals/editObjectivesConstraints', {
    project,
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

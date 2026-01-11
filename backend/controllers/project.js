
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

        const projects = await seda.projectsIndex(clientId, developerId);

        projects.reverse();

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
      projectType: 0,
      budget: 0,
      deliveryTime: 3,
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

    // require("../helpers/logs").log(project, "Project PUNTO 1");

    // Si existe req.session.scope.projectId y vale projectId, entonces sustituyo el
    // valor de project.milestones por req.session.scope.milestones.
    // Esto ocurre cuando estoy editando un scope.
    if (req.session.scope?.projectId == projectId) {
        project.milestones = req.session.scope.milestones
    }

   // require("../helpers/logs").log(project, "Project PUNTO 2");

    const allBudgets = await seda.budgetIndex();
    const allDeliveryTimes = await seda.deliveryTimeIndex();
    const allProjectTypes = await seda.projectTypeIndex();

    res.render('projects/showProject', {
        project,
        allBudgets,
        allDeliveryTimes,
        allProjectTypes
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
    projectType: body.projectType,
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

    const advancePaymentPercentage = 10;
    const documentHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";


    try {

        // require("../helpers/logs").log(projectId, "projectId");
        // require("../helpers/logs").log(req.session.scope, "Proposed Scope");
        // require("../helpers/logs").log(advancePaymentPercentage, "advancePaymentPercentage");
        // require("../helpers/logs").log(documentHash, "documentHash");
        // require("../helpers/logs").log(req.session.loginUser.token, "Token");

        await seda.scopeSubmit(projectId, req.session.scope.milestones, advancePaymentPercentage, documentHash, consultantComment, req.session.loginUser.token);

        delete req.session.scope;

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
    const project = await seda.project(projectId);
    const milestoneIds = project.milestones.map(milestone => milestone.id);

    const clientId = req.session.loginUser?.clientId;

    const clientResponse = req.body.clientResponse || "Genial no, lo siguiente."

    try {
        await seda.scopeAccept(projectId, milestoneIds, clientResponse, req.session.loginUser.token);

        console.log('Success: Scope accepted successfully.');

        res.redirect('/projects/' + projectId + '/escrow');

    } catch (error) {
        next(error);
    }
};


// Rechazar el scope: estado = ScopingInProgress
exports.scopeReject = async (req, res, next) => {

    const projectId = req.params.projectId;
    const project = await seda.project(projectId);

    const clientId = req.session.loginUser?.clientId;

    const clientResponse = req.body.clientResponse || "Peor imposible."

    try {
        await seda.scopeReject(projectId, clientResponse, req.session.loginUser.token);

        console.log('Success: Scope rechazado successfully.');

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

    // Para almacenar los milestones para el scope que hay que crear:
      req.session.scope = {
          projectId,
          milestones: []
      };

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


// Asigna Team al proyecto
exports.assignTeam = async (req, res, next) => {

    const projectId = req.params.projectId;

    try {
        const res1 = await seda.assignTeam(projectId, 2, req.session.loginUser.token);
        require("../helpers/logs").log(res1, "Assign Team");

        const res2 = await seda.getTeam(projectId);
        require("../helpers/logs").log(res2, "Get Team");


        const res3 = await seda.getScopeInfo(projectId);
        require("../helpers/logs").log(res3, "Get ScopeI nfo");



        console.log('Project team assigned successfully.');

        res.redirect('/projects/' + projectId);

    } catch (error) {
        next(error);
    }
};

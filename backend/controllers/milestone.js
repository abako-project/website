
const seda = require("../services/seda");

const states = require("../core/state");
const permissionController = require("./permission");


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
    deliveryDate: Date.now()
  };

  const allDeliveryTimes = await seda.deliveryTimeIndex();
  const allRoles = await seda.roleIndex();
  const allProficiencies = await seda.proficiencyIndex();
  const allSkills = await seda.skillIndex();

  res.render('milestones/newMilestone', {
    milestone,
    project,
    allDeliveryTimes,
    allRoles,
    allProficiencies,
    allSkills,
  });
};



// Crear milestone
exports.create = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  let {title, description, budget, deliveryTimeId, deliveryDate,
    roleId, proficiencyId, skills, availability} = req.body;

  deliveryDate = new Date(deliveryDate).valueOf() + req.session.browserTimezoneOffset - req.session.serverTimezoneOffset;

  roleId ||= null;
  proficiencyId ||= null;
  let skillIds = (skills ?? []).map(str => +str);

  let milestone = {
    title,
    description,
    budget,
    deliveryTimeId,
    deliveryDate,
    roleId,
    proficiencyId,
    skillIds,
    neededFullTimeDeveloper: availability === "fulltime",
    neededPartTimeDeveloper: availability === "parttime",
    neededHourlyDeveloper: availability === "hourly"
  };

  try {
    await seda.milestoneCreate(projectId, milestone);

    console.log('Success: Milestone created successfully.');
    res.redirect('/projects/' + projectId + '/milestones/edit');
  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      const allDeliveryTimes = await seda.deliveryTimeIndex();
      const allRoles = await seda.roleIndex();
      const allProficiencies = await seda.proficiencyIndex();
      const allSkills = await seda.skillIndex();

      res.render('milestones/newMilestone', {
        milestone,
        project,
        allDeliveryTimes,
        allRoles,
        allProficiencies,
        allSkills,
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

  const allDeliveryTimes = await seda.deliveryTimeIndex();
  const allRoles = await seda.roleIndex();
  const allProficiencies = await seda.proficiencyIndex();
  const allSkills = await seda.skillIndex();

  res.render('milestones/editMilestone', {
    project,
    milestone,
    allDeliveryTimes,
    allRoles,
    allProficiencies,
    allSkills,
  });
};


// Actualizar milestone
exports.update = async (req, res) => {

  const {body} = req;

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const milestoneId = req.params.milestoneId;
  const milestone = await seda.milestone(milestoneId);

  milestone.title = body.title;
  milestone.description = body.description;
  milestone.budget = body.budget;
  milestone.deliveryTimeId = body.deliveryTimeId;
  milestone.deliveryDate = new Date(body.deliveryDate).valueOf() + req.session.browserTimezoneOffset - req.session.serverTimezoneOffset;
  milestone.roleId = body.roleId || null;
  milestone.proficiencyId = body.proficiencyId || null;
  milestone.skillIds = (body.skills ?? []).map(str => +str);
  milestone.neededFullTimeDeveloper = body.availability === "fulltime";
    milestone.neededPartTimeDeveloper = body.availability === "parttime";
    milestone.neededHourlyDeveloper = body.availability === "hourly";
  try {
    await seda.milestoneUpdate(milestone.id, milestone);

    // await milestone.save();
    console.log('Milestone edited successfully.');
    res.redirect('/projects/' + project.id + '/milestones/edit');
  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      const allDeliveryTimes = await seda.deliveryTimeIndex();
      const allRoles = await seda.roleIndex();
      const allProficiencies = await seda.proficiencyIndex();
      const allSkills = await seda.skillIndex();

      res.render('milestones/editMilestone', {
        project,
        milestone,
        allDeliveryTimes,
        allRoles,
        allProficiencies,
        allSkills,
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

// Assignar el developer de un milestone
exports.assignDeveloper = async (req, res, next) => {

  const {body} = req;

  const projectId = req.params.projectId;
  const milestoneId = req.params.milestoneId;

  try {
    await seda.milestoneAssignDeveloper(milestoneId, body.developerId);

    console.log('Milestone developer assigned successfully.');

    res.redirect('/projects/' + projectId);

  } catch (error) {
    next(error);
  }
}


// El developer acepta un milestone
exports.developerAcceptAssignedMilestone = async (req, res, next) => {

  const {body} = req;

  const projectId = req.params.projectId;
  const milestoneId = req.params.milestoneId;

  try {
    await seda.milestoneDeveloperAccept(milestoneId) ;

    console.log('Milestone state updateded successfully.');

    res.redirect('/projects/' + projectId);

  } catch (error) {
    next(error);
  }
};



// El developer rechaza un milestone
exports.developerRejectAssignedMilestone = async (req, res, next) => {

    const {body} = req;

    const projectId = req.params.projectId;
    const milestoneId = req.params.milestoneId;

    try {
        await seda.milestoneDeveloperReject(milestoneId) ;

        console.log('Milestone state updateded successfully.');

        res.redirect('/projects/' + projectId);

    } catch (error) {
        next(error);
    }
};

// Devuelve la pagina para que un developer acepte o rechace un milestone
exports.developerAcceptOrRejectAssignedMilestonePage = async (req, res, next) => {

    try {
        const projectId = req.params.projectId;
        const project = await seda.project(projectId);

        const milestoneId = req.params.milestoneId;
        const milestone = await seda.milestone(milestoneId);

        res.render('milestones/developerAcceptOrRejectAssignedMilestone', {
            project,
            milestone
        });
    } catch (error) {
        next(error);
    }
};

// Actualiza el estadop del milestone a aceptado o rechazado
exports.developerAcceptOrRejectAssignedMilestoneUpdate = async (req, res, next) => {

    try {

        let {comment, accept} = req.body;

        const projectId = req.params.projectId;
        const milestoneId = req.params.milestoneId;

        if (accept === "accept") {
            await seda.milestoneDeveloperAccept(milestoneId, comment) ;
        } else if (accept === "reject") {
            await seda.milestoneDeveloperReject(milestoneId, comment) ;
        } else {
            req.flash("error", "El developer solo puede aceptar o rechazar los milestones que le han asignado");
        }

        res.redirect('/projects/' + projectId);

    } catch (error) {
        next(error);
    }
};

// Devolver ls pagina para que el consultor suba un milestone para que lo revise el cliente
exports.submitMilestoneForm = async (req, res, next) => {

    try {

        const projectId = req.params.projectId;
        const project = await seda.project(projectId);

        const milestoneId = req.params.milestoneId;
        const milestone = await seda.milestone(milestoneId);

        res.render('milestones/consultorSubmitMilestone', {
            project,
            milestone
        });

    } catch (error) {
        next(error);
    }
};


// Action del formulario usado por el consultor para subir un milestone para que lo revise el cliente
exports.submitMilestoneAction = async (req, res, next) => {

    try {

        let {documentation, links} = req.body;

        const projectId = req.params.projectId;
        const project = await seda.project(projectId);

        const milestoneId = req.params.milestoneId;
        const milestone = await seda.milestone(milestoneId);

        await seda.milestoneConsultantSubmit(milestoneId, documentation, links) ;

        res.redirect('/projects/' + projectId);


    } catch (error) {
        next(error);
    }
};


// Devuelve la pagina para que un cliente acepte o rechace un milestone submission
exports.clientAcceptOrRejectSubmittedMilestonePage = async (req, res, next) => {

    try {
        const projectId = req.params.projectId;
        const project = await seda.project(projectId);

        const milestoneId = req.params.milestoneId;
        const milestone = await seda.milestone(milestoneId);

        res.render('milestones/clientAcceptOrRejectSubmittedMilestone', {
            project,
            milestone
        });
    } catch (error) {
        next(error);
    }
};


// Actualiza el estado del milestone a SubmissionRejectedByClient o Completed
exports.clientAcceptOrRejectSubmittedMilestoneUpdate = async (req, res, next) => {

    try {

        let {comment, accept} = req.body;

        const projectId = req.params.projectId;
        const milestoneId = req.params.milestoneId;

        if (accept === "accept") {
            await seda.milestoneClientAcceptSubmission(milestoneId, comment) ;
        } else if (accept === "reject") {
            await seda.milestoneClientRejectSubmission(milestoneId, comment) ;
        } else {
            req.flash("error", "El cliente solo puede aceptar o rechazar los milestones que le han entregado");
        }

        res.redirect('/projects/' + projectId);

    } catch (error) {
        next(error);
    }
};



// Muestra la pagina con la historia del milestone para que el cliente y el consultor se envien mensajes
// y resuelvan los conflictos.
exports.historyPage = async (req, res, next) => {

    try {
        const projectId = req.params.projectId;
        const project = await seda.project(projectId);

        const milestoneId = req.params.milestoneId;
        const milestone = await seda.milestone(milestoneId);

        res.render('milestones/showMilestoneHistory', {
            project,
            milestone
        });

    } catch (error) {
        next(error);
    }
};

// El cliente hace un rollback del rechazo del milestome submission.
exports.clientRollbackRejectedSubmission = async (req, res, next) => {

    try {

        const projectId = req.params.projectId;
        const milestoneId = req.params.milestoneId;

        await seda.milestoneClientRollbackRejectedSubmission(milestoneId);

        res.redirect('/projects/' + projectId);

    } catch (error) {
        next(error);
    }
};


// El cliente añade un comentario a la historia de un milestone
exports.createClientHistoryComments = async (req, res, next) => {

    try {
        const {comment} = req.body;

        const projectId = req.params.projectId;
        const milestoneId = req.params.milestoneId;

        await seda.milestoneClientAddHistoryComment(milestoneId, comment);

        res.redirect('/projects/' + projectId + '/milestones/' + milestoneId + '/history');

    } catch (error) {
        next(error);
    }
};

// El consultor añade un comentario a la historia de un milestone

exports.createConsultantHistoryComments = async (req, res, next) => {

    try {
        const {comment} = req.body;

        const projectId = req.params.projectId;
        const milestoneId = req.params.milestoneId;

        await seda.milestoneConsultantAddHistoryComment(milestoneId, comment);

        res.redirect('/projects/' + projectId + '/milestones/' + milestoneId + '/history');

    } catch (error) {
        next(error);
    }
};







const seda = require("../services/seda");


// Middleware: autenticación requerida
exports.isAuthenticated = (req, res, next) => {
  if (req.session.loginUser) return next();
  req.flash("info", "Login required: log in and retry.");
  res.redirect('/auth/login');
};


// MW that allows to pass only if the logged in user is admin
exports.adminRequired = (req, res, next) => {
  const isAdmin = !!req.session.loginUser?.isAdmin;
  if (isAdmin) {
    next();
  } else {
    console.log('Prohibited operation: The logged in user is not an administrator.');
    next(new Error('Prohibited operation: The logged in user is not an administrator.'));
  }
};


// MW that allows actions only if the logged in user is a client.
exports.clientRequired = (req, res, next) => {
  const clientIsLogged = !!req.session.loginUser?.clientId;
  if (clientIsLogged) {
    next();
  } else {
    console.log('Prohibited operation: The logged in user is not a client.');
    next(new Error('Prohibited operation: The logged in user is not a client.'));
  }
};


// MW that allows actions only if the logged in user is a developer.
exports.developerRequired = (req, res, next) => {
  const developerIsLogged = !!req.session.loginUser?.developerId;
  if (developerIsLogged) {
    next();
  } else {
    console.log('Prohibited operation: The logged in user is not a developer.');
    next(new Error('Prohibited operation: The logged in user is not a developer.'));
  }
};


// MW that allows actions only if the logged in user is the project client.
exports.projectClientRequired = async (req, res, next) => {
  const clientIsLogged = !!req.session.loginUser?.clientId;

  const projectId = req.params.projectId;
  const projectClientId = await seda.projectClientId(projectId);

  const clientLoggedIsProjectClient = projectClientId === req.session.loginUser?.clientId;

  if (clientIsLogged && clientLoggedIsProjectClient) {
    next();
  } else {
    console.log('Prohibited operation: The logged in user is not the project client.');
    next(new Error('Prohibited operation: The logged in user is not the project client.'));
  }
};


// MW that allows actions only if the logged in user is the project consultant.
exports.projectConsultantRequired = async (req, res, next) => {
  const developerIsLogged = !!req.session.loginUser?.developerId;

  const projectId = req.params.projectId;
  const projectConsultanttId = await seda.projectConsultantId(projectId);

  const developerLoggedIsProjectConsultant = projectConsultanttId === req.session.loginUser?.developerId;

  if (developerIsLogged && developerLoggedIsProjectConsultant) {
    next();
  } else {
    console.log('Prohibited operation: The logged in user is not the project consultant.');
    next(new Error('Prohibited operation: The logged in user is not the project consultant.'));
  }
};


// MW that allows actions only if the logged in user is a project task developer.
exports.projectDeveloperRequired = (req, res, next) => {
  // PENDIENTE DE IMPLEMENTAR
  console.log('Prohibited operation: The logged in user is not a task developer.');
  next(new Error('Prohibited operation: The logged in user is not a task developer.'));
};


// MW that allows actions only if the logged in user is the developer assigned to the milestone.
exports.milestoneDeveloperRequired = async (req, res, next) => {
  const developerIsLogged = !!req.session.loginUser?.developerId;

  const milestoneId = req.params.milestoneId;
  const milestoneDeveloperId = await seda.milestoneDeveloperId(milestoneId);

  const developerLoggedIsMilestoneDeveloper = milestoneDeveloperId === req.session.loginUser?.developerId;

  if (developerIsLogged && developerLoggedIsMilestoneDeveloper) {
    next();
  } else {
    console.log('Prohibited operation: The logged in user is not the milestone developer.');
    next(new Error('Prohibited operation: The logged in user is not the milestone developer.'));
  }
};

// MW that allows actions only if the logged in user type is one of these:
//   admin  - logged user is admin
//   client - logged user is a client
//   projectClient - The logged user is the project client
//   developer - logged user is a developer
//   projectDeveloper - The logged user is one of the project tasks developer
//   projectConsultant - The logged user is the project consultant
//   milestoneDeveloper - The logged user is the developer assigned to the milestone
exports.userTypesRequired = ({
                              admin = false,
                              client = false,
                              projectClient = false,
                              developer = false,
                              projectDeveloper = false,
                              projectConsultant = false,
                              milestoneDeveloper = false
                            }) => async (req, res, next) => {

  if (admin) {
    const adminIsLogged = !!req.session.loginUser?.isAdmin;
    if (adminIsLogged) {
      return next();
    }
  }

  if (client) {
    const clientIsLogged = !!req.session.loginUser?.clientId;
    if (clientIsLogged) {
      return next();
    }
  }

  if (projectClient) {
    const clientIsLogged = !!req.session.loginUser?.clientId;

    const projectId = req.params.projectId;
    const projectClientId = await seda.projectClientId(projectId);

    const clientLoggedIsProjectClient = projectClientId === req.session.loginUser?.clientId;

    if (clientIsLogged && clientLoggedIsProjectClient) {
      return next();
    }
  }

  if (developer) {
    const developerIsLogged = !!req.session.loginUser?.developerId;
    if (developerIsLogged) {
      return next();
    }
  }

  if (projectDeveloper) {
    // PENDIENTE
  }

  if (projectConsultant) {
    const developerIsLogged = !!req.session.loginUser?.developerId;

    const projectId = req.params.projectId;
    const projectConsultanttId = await seda.projectConsultantId(projectId);

    const developerLoggedIsProjectConsultant = projectConsultanttId === req.session.loginUser?.developerId;

    if (developerIsLogged && developerLoggedIsProjectConsultant) {
      return next();
    }
  }

  if (milestoneDeveloper) {

      console.log("**** Permisos milestoneDeveloper");

      const developerIsLogged = !!req.session.loginUser?.developerId;

      const milestoneId = req.params.milestoneId;
      const milestone = await seda.milestone(milestoneId);
      const milestoneDeveloperId = milestone?.assignation?.developerId;

      const developerLoggedIsMilestoneDeveloper = milestoneDeveloperId === req.session.loginUser?.developerId;

      if (developerIsLogged && developerLoggedIsMilestoneDeveloper) {
          return next();
      }
  }

  console.log('Prohibited operation: The logged in user has not the required permissions.');
  next(new Error('Prohibited operation: The logged in user has not the required permissions.'));
};

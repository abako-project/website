

const seda = require("../services/seda");


// Editar todos las tasks de todos los milestone del project5o
exports.editAll = async (req, res, next) => {

  try {
    const projectId = req.params.projectId;
    const project = await seda.project(projectId);

    res.render('tasks/editAll', {project});
  } catch (error) {
    next(error);
  }
};


// Mostrar todos las tasks de todos los milestone del project5o
exports.showAll = async (req, res, next) => {

  try {
    const projectId = req.params.projectId;
    const project = await seda.project(projectId);

    res.render('tasks/showAll', {project});
  } catch (error) {
    next(error);
  }
};

// Mostrar formulario de creación de una task para un milestone
exports.new = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const milestoneId = req.params.milestoneId;
  const milestone = await seda.milestone(milestoneId);

  const allRoles = await seda.roleIndex();

  const task = {
    title: "",
    description: "",
    budget: "",
    currency: "",
    deliveryDate: Date.now() + 60 * 60 * 1000,
    roleId : 0
  };

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;

  res.render('tasks/new', {
    task,
    milestone,
    project,
    allRoles,
    browserTimezoneOffset,
  });
};



// Crear task
exports.create = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const milestoneId = req.params.milestoneId;
  const milestone = await seda.milestone(milestoneId);

  let {title, description, budget, currency, deliveryDate, roleId} = req.body;

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  deliveryDate = new Date(deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset;

  let task = {
    title,
    description,
    budget,
    currency,
    deliveryDate,
    roleId
  };

  try {
    await seda.taskCreate(milestoneId, task);

    console.log('Success: Task created successfully.');
    res.redirect('/projects/' + project.id + '/tasks/edit');
  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.render('tasks/new', {
        task,
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
exports.edit = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const taskId = req.params.taskId;
  const task = await seda.task(taskId);

  const milestoneId = req.params.milestoneId;
  const milestone = await seda.milestone(milestoneId);

  const allRoles = await seda.roleIndex();

  // Timezone offset del cliente
  let browserTimezoneOffset = Number(req.query.browserTimezoneOffset ?? 0);
  browserTimezoneOffset = Number.isNaN(browserTimezoneOffset) ? 0 : browserTimezoneOffset;


  res.render('tasks/edit', {
    task,
    milestone,
    project,
    allRoles,
    browserTimezoneOffset,
  });
};


// Actualizar task
exports.update = async (req, res, next) => {

  const {body} = req;

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const taskId = req.params.taskId;
  const task = await seda.task(taskId);

  const milestoneId = req.params.milestoneId;
  const milestone = await seda.milestone(milestoneId);

  let {browserTimezoneOffset} = req.query;
  browserTimezoneOffset = Number(browserTimezoneOffset);

  const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

  task.title = body.title;
  task.description = body.description;
  task.budget = body.budget;
  task.currency = body.currency;
  task.deliveryDate = new Date(body.deliveryDate).valueOf() + browserTimezoneOffset - serverTimezoneOffset;
  task.roleId = body.roleId;

  try {
    await seda.taskUpdate(task.id, task);

    console.log('Task edited successfully.');
    res.redirect('/projects/' + project.id + '/tasks/edit');
  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      const allRoles = await seda.roleIndex();

      res.render('tasks/edit', {
        task,
        milestone,
        project,
        allRoles,
        browserTimezoneOffset,
      });
    } else {
      next(error);
    }
  }
};




// Publicar las tasks creadas
exports.submitTasks = async (req, res, next) => {

  const projectId = req.params.projectId;
  const developerId = req.session.loginUser?.developerId;

  try {
    await seda.tasksSubmit(projectId);

    console.log('Success: Tasks submitted successfully.');

    if (developerId) {
      res.redirect('/projects/' + projectId);
    } else {
      res.redirect('/projects/');
    }
  } catch (error) {
    next(error);
  }
};

// Mostrar formulario para seleccioanr el developer de una task
exports.selectDeveloper = async (req, res, next) => {

  const projectId = req.params.projectId;
  const project = await seda.project(projectId);

  const taskId = req.params.taskId;
  const task = await seda.task(taskId);

  const milestoneId = req.params.milestoneId;
  const milestone = await seda.milestone(milestoneId);

  try {
    const validDevelopers = await seda.developersWithRole(task.roleId);

    res.render('tasks/selectDeveloper', {
      project,
      milestone,
      task,
      validDevelopers
    });
  } catch (error) {
    next(error);
  }
}

// Actualizar el developer de una task
exports.setDeveloper = async (req, res, next) => {

  const {body} = req;

  const projectId = req.params.projectId;
  const taskId = req.params.taskId;

  console.log(">>>>>>>>>>>>>> TaskId =", taskId, "   DevloperId =", body.developerId);

  try {
    await seda.taskSetDeveloper(taskId, body.developerId);

    console.log('Task developer assigned successfully.');

    res.redirect('/projects/' + projectId + "/tasks");

  } catch (error) {
    next(error);
  }
}



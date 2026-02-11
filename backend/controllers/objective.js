

const seda = require("../models/seda");



// Crear objectivo
exports.create = async (req, res, next) => {

  let {description} = req.body;

  const projectId = req.params.projectId;

  try {
    await seda.objectiveCreate(projectId, description);

    console.log('Success: Project Objective created successfully.');

    res.redirect('/projects/' + projectId + '/objectives_constraints/edit');


  } catch (error) {
    if (error instanceof seda.ValidationError) {
      req.flash('error', 'Error: There are errors in the form:');
      error.errors.forEach(({message}) => req.flash('error', message));

      res.redirect('/projects/' + projectId + '/objectives_constraints/edit');

    } else {
      next(error);
    }
  }
};


// Eliminar objectivo
exports.destroy = async (req, res, next) => {

  const projectId = req.params.projectId;
  const objectiveId = req.params.objectiveId;

  try {
    await seda.objectiveDestroy(objectiveId)

    console.log('Objective deleted successfully.');
    res.redirect('/projects/' + projectId + '/objectives_constraints/edit');
  } catch (error) {
    next(error);
  }
};


// Intercambiar el orden de visualizacion de 2 objectives
exports.swapOrder = async (req, res, next) => {

  try {
    const objective1 = await seda.objective(req.params.id1);

    await seda.objectivesSwapOrder(req.params.id1, req.params.id2);

    console.log('Objectives swapped successfully.');
    res.redirect('/projects/' + objective1.projectId + '/objectives_constraints/edit');
  } catch (error) {
    next(error);
  }
};

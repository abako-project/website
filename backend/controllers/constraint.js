

const seda = require("../services/seda");



// Crear constraint
exports.create = async (req, res, next) => {

    let {description} = req.body;

    const projectId = req.params.projectId;

    try {
        await seda.constraintCreate(projectId, description);

        console.log('Success: Project constraint created successfully.');

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


// Eliminar constraint
exports.destroy = async (req, res) => {

    const projectId = req.params.projectId;
    const constraintId = req.params.constraintId;

    try {
        await seda.constraintDestroy(constraintId)

        //await constraint.destroy();
        console.log('Constraint deleted successfully.');
        res.redirect('/projects/' + projectId + '/objectives_constraints/edit');
    } catch (error) {
        next(error);
    }
};


// Intercambiar el orden de visualizacion de 2 edit
exports.swapOrder = async (req, res, next) => {

    try {
        const constraint1 = await seda.constraint(req.params.id1);

        await seda.constraintsSwapOrder(req.params.id1, req.params.id2);

        console.log('edit swapped successfully.');
        res.redirect('/projects/' + constraint1.projectId + '/objectives_constraints/edit');
    } catch (error) {
        next(error);
    }
};


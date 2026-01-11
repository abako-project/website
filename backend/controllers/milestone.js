const seda = require("../services/seda");

const states = require("../core/state");
const permissionController = require("./permission");

const allSkills = require('../utils/skills.json');
const allRoles = require('../utils/roles.json');
const availabilityOptions = require('../utils/availability.json');
const allProficiencies = require('../utils/proficiency.json');


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

        const projects = await seda.projectsIndex(clientId, developerId);

        projects.reverse();

        const allBudgets = await seda.budgetIndex();
        const allDeliveryTimes = await seda.deliveryTimeIndex();
        const allProjectTypes = await seda.projectTypeIndex();

        // No se puede usar el valor client en las opciones cuando
        // hay llamadas anidadas a la funcion include de EJS.
        res.render('dashboard/milestones', {
            projects,
            c: client,
            developer,
            allBudgets,
            allDeliveryTimes,
            allProjectTypes
        });
    } catch (error) {
        next(error);
    }
};


// Editar todos los milestones de un proyecto
exports.editAll = async (req, res, next) => {

    try {
        const projectId = req.params.projectId;
        const project = await seda.project(projectId);

        const allDeliveryTimes = await seda.deliveryTimeIndex();

        res.render('milestones/editMilestones', {
            project,
            allDeliveryTimes
        });
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


    res.render('milestones/newMilestone', {
        milestone,
        project,
        allDeliveryTimes,
        allRoles,
        allProficiencies,
        availabilityOptions,
        allSkills,
    });
};


// Crear milestone
exports.create = async (req, res, next) => {

    const projectId = req.params.projectId;
    const project = await seda.project(projectId);

    let {
        title, description, budget, deliveryTime, deliveryDate,
        role, proficiency, skills, availability
    } = req.body;

    deliveryDate = new Date(deliveryDate).valueOf() + req.session.browserTimezoneOffset - req.session.serverTimezoneOffset;

    budget ||= null;
    role ||= null;
    proficiency ||= null;
    skills = Array.isArray(skills) ? skills : skills ? [skills] : ["none"];

    let milestone = {
        title,
        description,
        budget,
        deliveryTime,
        deliveryDate,
        role,
        proficiency,
        skills,
        availability,
        neededFullTimeDeveloper: availability === "FullTime",
        neededPartTimeDeveloper: availability === "PartTime",
        neededHourlyDeveloper: availability === "WeeklyHours",
    };

    require("../helpers/logs").log(milestone, "Nuevo Milestone");

    try {
        await seda.milestoneCreate(req.session.scope, projectId, milestone);

        require("../helpers/logs").log(req.session.scope, "Creado Milestone");

        console.log('Success: Milestone created successfully.');
        res.redirect('/projects/' + projectId + '/milestones/edit');
    } catch (error) {
        if (error instanceof seda.ValidationError) {
            req.flash('error', 'Error: There are errors in the form:');
            error.errors.forEach(({message}) => req.flash('error', message));

            const allDeliveryTimes = await seda.deliveryTimeIndex();

            res.render('milestones/newMilestone', {
                milestone,
                project,
                allDeliveryTimes,
                allRoles,
                allProficiencies,
                availabilityOptions,
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

    let milestone;
    if (req.session.scope?.projectId == projectId) {
        milestone = req.session.scope.milestones[milestoneId];
    } else {
        milestone = await seda.milestone(milestoneId);
    }

    const allDeliveryTimes = await seda.deliveryTimeIndex();

    res.render('milestones/editMilestone', {
        project,
        milestone,
        milestoneId,
        allDeliveryTimes,
        allRoles,
        allProficiencies,
        availabilityOptions,
        allSkills,
    });
};


// Actualizar milestone
exports.update = async (req, res) => {

    const {body} = req;

    const projectId = req.params.projectId;
    const project = await seda.project(projectId);

    const milestoneId = req.params.milestoneId;

    let milestone;
    if (req.session.scope?.projectId == projectId) {
        milestone = req.session.scope.milestones[milestoneId];
    } else {
        milestone = await seda.milestones(milestoneId);
    }

    milestone.title = body.title;
    milestone.description = body.description;
    milestone.budget = body.budget;
    milestone.deliveryTime = body.deliveryTime;
    milestone.deliveryDate = new Date(body.deliveryDate).valueOf() + req.session.browserTimezoneOffset - req.session.serverTimezoneOffset;
    milestone.role = body.role || null;
    milestone.proficiency = body.proficiency || null;
    milestone.skills = Array.isArray(body.skills) ? body.skills : body.skills ? [body.skills] : ["none"];
    milestone.availability = body.availability;

    milestone.neededFullTimeDeveloper = body.availability === "FullFime";
    milestone.neededPartTimeDeveloper = body.availability === "PartTime";
    milestone.neededHourlyDeveloper = body.availability === "WeeklyHours";

    try {
        if (req.session.scope?.projectId == projectId) {
            req.session.scope.milestones[milestoneId] = milestone;
        } else {
            await seda.milestoneUpdate(milestone.id, milestone);
        }

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
                milestoneId,
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

        if (req.session.scope?.projectId == projectId) {

            req.session.scope.milestones.splice(milestoneId, 1);

        } else {
            await seda.milestoneDestroy(projectId, milestoneId, req.session.loginUser.token);
        }

        console.log('Milestone deleted successfully.');
        res.redirect('/projects/' + projectId + '/milestones/edit');
    } catch (error) {
        next(error);
    }
};


// Intercambiar el orden de visualizacion de 2 milestones
exports.swapOrder = async (req, res, next) => {

    try {

        await seda.milestoneSwapOrder(req.session.scope, req.params.id1, req.params.id2);

        console.log('Milestones swapped successfully.');
        res.redirect('/projects/' + req.session.scope.projectId + '/milestones/edit');
    } catch (error) {
        next(error);
    }
};

//-----------------------------------------------------------------------------------
//
//  Developer debe aceptar o rechazar el milestone que le han asignado
//
//  Solo para la versin BBDD.
//
//-------------------------------------------------------------------------------------

// El developer acepta un milestone
exports.developerAcceptAssignedMilestone = async (req, res, next) => {

    const {body} = req;

    const projectId = req.params.projectId;
    const milestoneId = req.params.milestoneId;

    try {
        await seda.milestoneDeveloperAccept(milestoneId);

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
        await seda.milestoneDeveloperReject(milestoneId);

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
            await seda.milestoneDeveloperAccept(milestoneId, comment);
        } else if (accept === "reject") {
            await seda.milestoneDeveloperReject(milestoneId, comment);
        } else {
            req.flash("error", "El developer solo puede aceptar o rechazar los milestones que le han asignado");
        }

        res.redirect('/projects/' + projectId);

    } catch (error) {
        next(error);
    }
};


//-----------------------------------------------------------------------------------
//
//  Conssultor presenta un formulario para enviar un milestone al cliente para que lo acepte.
//  En el formulario se rellena campos con enlaces a documentacion ,....
//
//  Solo para la versin BBDD.
//
//-------------------------------------------------------------------------------------


// Devolver la pagina para que el consultor suba un milestone para que lo revise el cliente
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

        await seda.milestoneConsultantSubmit(milestoneId, documentation, links);

        res.redirect('/projects/' + projectId);


    } catch (error) {
        next(error);
    }
};


//-----------------------------------------------------------------------------------
//
//  Consultor envia un milestone al cliente para que lo acepte.
//  No hay ningun formulario. Se envia directamente.
//
//  Solo para la versin Virto.
//
//-------------------------------------------------------------------------------------


// El consultor complete un milestone:
exports.submitMilestoneForReview = async (req, res, next) => {

    const projectId = req.params.projectId;
    const milestoneId = req.params.milestoneId;

    try {

        await seda.milestoneConsultantSubmitForReview(projectId, milestoneId, req.session.loginUser.token);

        console.log('Success: Milestone submited for review successfully.');

        res.redirect('/projects/' + projectId);

    } catch (error) {
        next(error);
    }
};



//-----------------------------------------------------------------------------------
//
//  El cliente debe aceptar o rechazar el trabajo realizado en el milestone que le ha enviado el consultor.
//
//  Solo para la versin Virto.
//
//-------------------------------------------------------------------------------------



// Devuelve la pagina para que un cliente acepte o rechace un milestone submission
exports.clientAcceptOrRejectSubmittedMilestonePage = async (req, res, next) => {

    try {
        const projectId = req.params.projectId;
        const project = await seda.project(projectId);

        const milestoneId = req.params.milestoneId;
        const milestone = project.milestones.find(milestone => milestone.id == milestoneId);

        const allBudgets = await seda.budgetIndex();
        const allDeliveryTimes = await seda.deliveryTimeIndex();
        const allProjectTypes = await seda.projectTypeIndex();

        res.render('milestones/clientAcceptOrRejectSubmittedMilestone', {
            project,
            milestone,
            allBudgets,
            allDeliveryTimes,
            allProjectTypes
        });
    } catch (error) {
        next(error);
    }
};


// Actualiza el estado del milestone a SubmissionRejectedByClient o AwaitingPayment
exports.clientAcceptOrRejectSubmittedMilestoneUpdate = async (req, res, next) => {

    try {

        let {comment, accept} = req.body;

        const projectId = req.params.projectId;
        const milestoneId = req.params.milestoneId;

        if (accept === "accept") {
            await seda.milestoneClientAcceptSubmission(projectId, milestoneId, comment, req.session.loginUser.token);
        } else if (accept === "reject") {
            await seda.milestoneClientRejectSubmission(projectId, milestoneId, comment, req.session.loginUser.token);
        } else {
            req.flash("error", "El cliente solo puede aceptar o rechazar los milestones que le han entregado");
        }

        res.redirect('/projects/' + projectId);

    } catch (error) {
        next(error);
    }
};




/* BORRAR

// El cliente acepta el trabajo realizado en un milestone:
exports.completeMilestone = async (req, res, next) => {

    const projectId = req.params.projectId;
    const milestoneId = req.params.milestoneId;

    try {

        await seda.milestoneClientComplete(projectId, milestoneId, req.session.loginUser.token);

        console.log('Success: Milestone completed successfully.');

        res.redirect('/projects/' + projectId);

    } catch (error) {
        next(error);
    }
};


 */


// Muestra la pagina con la historia del milestone para que el cliente y el consultor se envien mensajes
// y resuelvan los conflictos.
exports.historyPage = async (req, res, next) => {

    try {
        const projectId = req.params.projectId;
        const project = await seda.project(projectId);

        const milestoneId = req.params.milestoneId;
        const milestone = await seda.milestone(milestoneId);

        const milestoneLogs = await seda.milestoneLogs(milestoneId);

        res.render('milestones/showMilestoneLogs', {
            project,
            milestone,
            milestoneLogs
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


// El sistema (la DAO) para automaticmante cuando el milestone se ha completado satistactoriamente.
exports.daoPay = async (req, res, next) => {
    try {

        const projectId = req.params.projectId;
        const milestoneId = req.params.milestoneId;

        await seda.milestoneDaoPay(milestoneId);

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



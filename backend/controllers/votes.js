const seda = require("../models/seda");
const permissionController = require("./permission");
// GET pantalla de votaciones segun el tipo de ususrio logueado devuelve a los developers o al consultor para que los voten 
//se puede resumir codigo pero al ser función sujeta a cambios de requisitos, se deja así para mayor claridad

// Devuelve un panel para que el cliente valore al consultor del proyecto
exports.clientRating = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const project = await seda.project(projectId);
        if (!project) throw new Error('Project not found.');

        // Quitar si cliente no vota a developers
        let developers = await seda.developers(projectId);

        const voteData = {
            project,
            title: "Evaluate Consultant",
            subtitle: "Choose the evaluation for project consultant",
            clientRating: {
                consultant: {
                    name: project.consultant.name,
                    subtitle: "",
                    userId: "coordinatorRating",
                    email: project.consultant.email,
                    imageUrl: `/developers/${project.consultantId}/attachment`
                },
                // Quitar si cliente no vota a developers
                developers: await Promise.all(developers.map(async developer => {
                    const developerWorkerAddress = await seda.getWorkerAddress(developer.email);
                    return {
                        name: developer.name,
                        subtitle: `${developer.role} ${developer.proficiency}`,
                        userId: developerWorkerAddress,
                        email: developer.email,
                        imageUrl: `/developers/${developer.id}/attachment`
                    };
                }))
            }
        };

        require("../helpers/logs").log(voteData, "Client 2 Consultant - voteData");

        res.render('votations/vote', {voteData});
    } catch (error) {
        console.error('Error in viewVotes:', error);
        next(error);
    }
};


// Devuelve un panel para que el desarrollador de un milestone valore al consultor del proyecto
exports.developerRating = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const project = await seda.project(projectId);
        if (!project) throw new Error('Project not found.');

        const voteData = {
            project,
            title: "Evaluate Consultant",
            subtitle: "Choose the evaluation for project consultant",
            developerRating: {
                consultant: {
                    name: project.consultant.name,
                    subtitle: "",
                    userId: null,
                    email: project.consultant.email,
                    imageUrl: `/developers/${project.consultantId}/attachment`
                }
            }
        };

        require("../helpers/logs").log(voteData, "Developer 2 Consultant - voteData");

        res.render('votations/vote', {voteData});
    } catch (error) {
        console.error('Error in viewVotes:', error);
        next(error);
    }
};

//  Devuelve un panel para que el consultor valore al cliente del proyecto y a los desarrolladores de los milestones:
exports.consultantRatings = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const project = await seda.project(projectId);
        if (!project) throw new Error('Project not found.');

        let developers = await seda.developers(projectId);

        const voteData = {
            project,
            title: "Evaluate Client and Team Members",
            subtitle: "Choose the evaluation for each member",
            consultantRatings: {
                client: {
                    name: project.client.name,
                    subtitle: "",
                    userId: "clientRating",
                    email: project.client.email,
                    imageUrl: `/developers/${project.clientId}/attachment`
                },
                developers: await Promise.all(developers.map(async developer => {
                    const developerWorkerAddress = await seda.getWorkerAddress(developer.email);
                    return {
                        name: developer.name,
                        subtitle: `${developer.role} ${developer.proficiency}`,
                        userId: developerWorkerAddress,
                        email: developer.email,
                        imageUrl: `/developers/${developer.id}/attachment`
                    };
                }))
            }
        };

        require("../helpers/logs").log(voteData, "Consultant 2 Client - voteData");

        res.render('votations/vote', {voteData});
    } catch (error) {
        console.error('Error in viewVotes:', error);
        next(error);
    }
};


/*
exports.viewVotes = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const project = await seda.project(projectId);
        if (!project) throw new Error('Project not found.');

        //SOLO VOTA EL CONSULTOR
        let members = await seda.developers(projectId);

        const voteData = {
            project,
            members: await Promise.all(members.map(async member => {
                const attachment = await seda.developerAttachment(member.id);

                return {
                    name: member.name,
                    role: member.role || null,
                    proficiency: member.proficiency || null,
                    userId: member.developerWorkerAddress || null,
                    email: member.email || null,
                    imageUrl: attachment ? `/developers/${member.id}/attachment` : '/images/none.png'
                };
            }))
        };

        res.render('votations/vote', {voteData});

    } catch (error) {
        console.error('Error in viewVotes:', error);
        next(error);
    }

}
 */

// =============== SUBMIT RATINGS ===================================


exports.submitClientRating = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const targets = req.body.targets || [];
        const userIds = req.body.userIds || [];
        const scores = req.body.scores || [];

        if (!Array.isArray(targets) || !Array.isArray(userIds) || !Array.isArray(scores) ||
            userIds.length !== scores.length || targets.length !== scores.length) {
            throw new Error("Invalid vote data: mismatched arrays.");
        }

        let coordinatorRating = 0;
        let clientRating = 0;
        let teamRatings = [];

        for (let i = 0; i < targets.length; i++) {

            const score = parseFloat(scores[i]);

            if (targets[i] == "client") {
                clientRating = score;
            } else if (targets[i] == "consultant") {
                coordinatorRating = score;
            } else if (targets[i] == "developer") {
                teamRatings.push([userIds[i], score])
            }
        }

        // El proyecto se ha completado

        require("../helpers/logs").log({ coordinatorRating, ratings: teamRatings }, "submitClientRating");

       await seda.projectCompleted(projectId, { coordinatorRating, ratings: teamRatings }, req.session.loginUser.token);

        res.redirect("/projects/" + projectId);

    } catch (error) {
        console.error("Error submitting votes:", error);
        next(error);
    }
};

exports.submitConsultantRatings = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const targets = req.body.targets || [];
        const userIds = req.body.userIds || [];
        const scores = req.body.scores || [];

        if (!Array.isArray(targets) || !Array.isArray(userIds) || !Array.isArray(scores) ||
            userIds.length !== scores.length || targets.length !== scores.length) {
            throw new Error("Invalid vote data: mismatched arrays.");
        }

        let coordinatorRating = 0;
        let clientRating = 0;
        let teamRatings = [];

        for (let i = 0; i < targets.length; i++) {

            const score = parseFloat(scores[i]);

            if (targets[i] == "client") {
                clientRating = score;
            } else if (targets[i] == "consultant") {
                coordinatorRating = score;
            } else if (targets[i] == "developer") {
                teamRatings.push([userIds[i], score])
            }
        }

        require("../helpers/logs").log({clientRating, teamRatings}, "submitConsultantRatings");

        // El proyecto se ha completado
        await seda.submitConsultantRatings(projectId, {clientRating, teamRatings}, req.session.loginUser.token);

        res.redirect("/projects/" + projectId);

    } catch (error) {
        console.error("Error submitting votes:", error);
        next(error);
    }
};

exports.submitDeveloperRating = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const targets = req.body.targets || [];
        const userIds = req.body.userIds || [];
        const scores = req.body.scores || [];

        if (!Array.isArray(targets) || !Array.isArray(userIds) || !Array.isArray(scores) ||
            userIds.length !== scores.length || targets.length !== scores.length) {
            throw new Error("Invalid vote data: mismatched arrays.");
        }

        let coordinatorRating = 0;
        let clientRating = 0;
        let teamRatings = [];

        for (let i = 0; i < targets.length; i++) {

            const score = parseFloat(scores[i]);

            if (targets[i] == "client") {
                clientRating = score;
            } else if (targets[i] == "consultant") {
                coordinatorRating = score;
            } else if (targets[i] == "developer") {
                teamRatings.push([userIds[i], score])
            }
        }

        require("../helpers/logs").log({coordinatorRating}, "submitDeveloperRating");

        // El proyecto se ha completado
      await seda.submitDeveloperRating(projectId, {coordinatorRating}, req.session.loginUser.token);

        res.redirect("/projects/" + projectId);

    } catch (error) {
        console.error("Error submitting votes:", error);
        next(error);
    }
};


// POST procesar las votaciones enviadas por el usuario
exports.submitVotes = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const fromUserId = req.session.loginUser?.id;

        const userIds = req.body.userIds || [];
        const scores = req.body.scores || [];

        if (!Array.isArray(userIds) || !Array.isArray(scores) || userIds.length !== scores.length) {
            throw new Error("Invalid vote data: mismatched arrays.");
        }

        const rating = [];

        for (let i = 0; i < userIds.length; i++) {
            const toUserId = userIds[i];
            const score = parseFloat(scores[i]);
            rating.push([toUserId, score]);
        }

        // El proyecto se ha completado
        await seda.projectCompleted(projectId, rating, req.session.loginUser.token);


        res.redirect("/projects/" + projectId);

    } catch (error) {
        console.error("Error submitting votes:", error);
        next(error);
    }
};


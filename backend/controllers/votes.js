const seda = require("../models/seda");
// GET pantalla de votaciones segun el tipo de ususrio logueado devuelve a los developers o al consultor para que los voten 
//se puede resumir codigo pero al ser función sujeta a cambios de requisitos, se deja así para mayor claridad

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
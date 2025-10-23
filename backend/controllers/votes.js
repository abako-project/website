const seda = require("../services/seda");
// GET pantalla de votaciones segun el tipo de ususrio logueado devuelve a los developers o al consultor para que los voten 
//se puede resumir codigo pero al ser función sujeta a cambios de requisitos, se deja así para mayor claridad

exports.viewVotes = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const loginUser = req.session.loginUser;

        const project = await seda.project(projectId);
        if (!project) throw new Error('Project not found.');
        

        let members = [];

        if (loginUser?.developerId) {
            const devId = loginUser.developerId;
            const consultantId = await seda.projectConsultantId(projectId);

        if (devId === consultantId) {
            // Si el usuario logueado es el consultor → muestra a los developers del proyecto
            members = await seda.developers(projectId); 
        } else {
            // Si es un developer normal → muestra solo al consultor
            const consultant = await seda.developer(consultantId); 
            members = [consultant];
        }

        } else if (loginUser?.clientId) {
            // Si es cliente → muestra solo al consultor
            const consultantId = await seda.projectConsultantId(projectId);
            const consultant = await seda.developer(consultantId);
            members = [consultant];
        }
        const voteData = {
            project: {
                    id: project.id
            },
            members: await Promise.all(members.map(async member => {
                const attachment = await seda.developerAttachment(member.id);

                return {
                    name: member.name,
                    role: member.role?.name || null,
                    proficiency: member.proficiency?.description || null,
                    userId: member.user?.id || null,
                    email: member.user?.email || null,
                    mime: attachment?.mime || member.attachment?.mime || null,
                    imageUrl: attachment ? `/developers/${member.id}/attachment` : '/images/none.png'
                };
            }))
        };

        res.render('votations/vote', { voteData });

    } catch (error) {
    console.error('Error in viewVotes:', error);
    next(error);
    }
  
}
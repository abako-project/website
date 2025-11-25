const seda = require("../services/seda");
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

    const votes = [];

    for (let i = 0; i < userIds.length; i++) {
        const toUserId = parseInt(userIds[i]);
        const score = parseFloat(scores[i]);
        const existingVote = await seda.voteFindOne({ projectId, fromUserId, toUserId });

        if (existingVote) continue; 
        votes.push({ projectId, fromUserId, toUserId, score });
    }
    
    if (votes.length === 0) {
      console.warn("No valid votes to process.");
      return res.redirect("/backdoor");
    }
    await seda.votesCreate(votes);
    console.log("Votes saved successfully.");
    res.redirect('/backdoor'); 

  } catch (error) {
    console.error("Error submitting votes:", error);
    next(error);
  }
};

const {
  models: {Vote}
} = require('../../models');

/**
 * Crea múltiples votos para un proyecto determinado.
 * @param {Array} votes - Array de objetos { projectId, fromUserId, toUserId, score }
 */
exports.votesCreate = async (votes) => {
  try {
    for (const vote of votes) {
      await Vote.create({
        projectId: vote.projectId,
        fromUserId: vote.fromUserId,
        toUserId: vote.toUserId,
        score: vote.score
      });
    }
  } catch (error) {
    console.error("Error inserting votes via SEDA:", error);
    throw error;
  }
};

/**
 * Buscar un voto existente por proyecto y usuarios
 * @param {object} filter - { projectId, fromUserId, toUserId }
 * @returns {Vote|null}
 */
exports.voteFindOne = async (filter) => {
  return await Vote.findOne({ where: filter });
};
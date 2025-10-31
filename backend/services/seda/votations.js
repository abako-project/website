
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

/**
 * Obtiene todas las votaciones recibidas por un usuario concreto.
 * @param {number} userId - ID del user que recibe los votos.
 * @returns {Promise<Array>} Array de objetos Vote.
 */
exports.votesFindByUser = async (userId) => {
  try {
    return await Vote.findAll({
      where: { toUserId: userId },
      order: [['createdAt', 'DESC']]
    });
  } catch (error) {
    console.error("Error fetching votes for user via SEDA:", error);
    throw error;
  }
};
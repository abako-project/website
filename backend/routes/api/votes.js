/**
 * Votes API Routes
 *
 * JSON API endpoints for the voting/rating system.
 * These mirror the existing EJS votes controller but return JSON
 * instead of rendering views or redirecting.
 *
 * Voting flow:
 *   1. Consultant views the team members to rate (GET)
 *   2. Consultant submits ratings and marks project completed (POST)
 *
 * All routes require authentication via apiAuth middleware.
 */

const router = require('express').Router();
const seda = require('../../models/seda');
const apiAuth = require('../../middleware/apiAuth');

// ---------------------------------------------------------------------------
// All routes in this file require authentication
// ---------------------------------------------------------------------------
router.use(apiAuth);


/**
 * GET /api/votes/:projectId
 *
 * Get the list of team members to rate for a project.
 * Mirrors controllers/votes.js viewVotes.
 *
 * Only the consultant (coordinator) votes on developer performance.
 *
 * Response shape:
 * {
 *   project: { id, title, state, ... },
 *   members: [{ name, role, proficiency, userId, email, imageUrl }]
 * }
 */
router.get('/:projectId', async (req, res, next) => {
    try {
        const projectId = req.params.projectId;

        const project = await seda.project(projectId);
        if (!project) {
            const err = new Error('Project not found.');
            err.statusCode = 404;
            return next(err);
        }

        // Only the consultant votes
        const members = await seda.developers(projectId);

        const enrichedMembers = await Promise.all(
            members.map(async (member) => {
                let imageUrl = '/images/none.png';
                try {
                    const attachment = await seda.developerAttachment(member.id);
                    if (attachment) {
                        imageUrl = `/developers/${member.id}/attachment`;
                    }
                } catch (_e) {
                    // Attachment not available
                }

                return {
                    name: member.name,
                    role: member.role || null,
                    proficiency: member.proficiency || null,
                    userId: member.developerWorkerAddress || null,
                    email: member.email || null,
                    imageUrl
                };
            })
        );

        res.success({
            project: {
                id: project.id,
                title: project.title,
                state: project.state
            },
            members: enrichedMembers
        });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/votes/:projectId
 *
 * Submit votes (ratings) for team members and mark the project completed.
 * Mirrors controllers/votes.js submitVotes.
 *
 * Body: { votes: [{ userId: string, score: number }] }
 *
 * The scores are passed to seda.projectCompleted as an array of
 * [userId, score] tuples.
 */
router.post('/:projectId', async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const votes = req.body.votes || [];

        if (!Array.isArray(votes)) {
            const err = new Error('Invalid vote data: votes must be an array.');
            err.statusCode = 422;
            return next(err);
        }

        // Convert from { userId, score } objects to [userId, score] tuples
        const rating = votes.map((vote) => {
            return [vote.userId, parseFloat(vote.score)];
        });

        await seda.projectCompleted(projectId, rating, req.user.token);

        res.success({
            projectId,
            message: 'Votes submitted and project completed successfully.'
        });
    } catch (error) {
        next(error);
    }
});


module.exports = router;

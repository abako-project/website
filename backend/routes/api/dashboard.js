/**
 * Dashboard API Routes
 *
 * JSON API endpoint for dashboard data.
 * Mirrors the existing EJS dashboard controller but returns JSON
 * instead of redirecting to other EJS pages.
 *
 * The EJS dashboard controller simply redirects to the client or
 * developer projects listing. This API endpoint resolves those
 * redirects server-side and returns the actual data.
 */

const router = require('express').Router();
const seda = require('../../models/seda');
const apiAuth = require('../../middleware/apiAuth');


// ---------------------------------------------------------------------------
// All routes in this file require authentication
// ---------------------------------------------------------------------------
router.use(apiAuth);


/**
 * GET /api/dashboard
 *
 * Returns dashboard data for the authenticated user.
 *
 * For clients: returns their projects grouped by state.
 * For developers: returns projects where they are consultant or
 *                 assigned developer, grouped by state.
 *
 * Response shape:
 * {
 *   user: { email, name, clientId, developerId },
 *   projects: [ ... ],
 *   projectsByState: {
 *     "ProposalDraft": [ ... ],
 *     "ScopingInProgress": [ ... ],
 *     ...
 *   }
 * }
 */
router.get('/', async (req, res, next) => {
    try {
        const { clientId, developerId } = req.user;

        if (!clientId && !developerId) {
            return res.error('User has no client or developer profile.', 400);
        }

        // Fetch projects using the same SEDA call as the EJS controller chain.
        // The EJS dashboard redirects to /clients/:clientId/projects or
        // /developers/:developerId/projects, both of which call
        // seda.projectsIndex(clientId, developerId).
        const projects = await seda.projectsIndex(clientId || null, developerId || null);

        projects.reverse();

        // Group projects by their current state for the dashboard view
        const projectsByState = {};
        for (const project of projects) {
            const state = project.projectState || project.state || 'Unknown';
            if (!projectsByState[state]) {
                projectsByState[state] = [];
            }
            projectsByState[state].push(project);
        }

        res.success({
            user: {
                email: req.user.email,
                name: req.user.name,
                clientId: clientId || null,
                developerId: developerId || null
            },
            projects,
            projectsByState
        });
    } catch (error) {
        next(error);
    }
});


module.exports = router;

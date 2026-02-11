/**
 * Milestones API Routes
 *
 * JSON API endpoints for milestone workflow operations.
 * These mirror the existing EJS milestone controllers but return JSON
 * instead of rendering views or redirecting.
 *
 * Milestone workflow:
 *   1. Developer submits milestone for review (consultant submits work)
 *   2. Client accepts or rejects the submitted work
 *   3. Payment is handled after acceptance
 *
 * All routes require authentication via apiAuth middleware.
 * The token for external SEDA API calls comes from req.user.token.
 */

const router = require('express').Router();
const seda = require('../../models/seda');
const apiAuth = require('../../middleware/apiAuth');

// ---------------------------------------------------------------------------
// All routes in this file require authentication
// ---------------------------------------------------------------------------
router.use(apiAuth);


/**
 * GET /api/milestones/:projectId/:milestoneId
 *
 * Get a single milestone with full details.
 * Mirrors controllers/milestone.js edit (data fetching part).
 *
 * Requires the projectId because the SEDA layer needs it
 * to locate the milestone within a project.
 */
router.get('/:projectId/:milestoneId', async (req, res, next) => {
    try {
        const { projectId, milestoneId } = req.params;

        const milestone = await seda.milestone(projectId, milestoneId);

        res.success({ milestone });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/milestones/:projectId/:milestoneId/submit
 *
 * Consultant/Developer submits a milestone for client review.
 * Mirrors controllers/milestone.js submitMilestoneForReview.
 *
 * This transitions the milestone from MilestoneInProgress
 * to WaitingClientAcceptSubmission.
 */
router.post('/:projectId/:milestoneId/submit', async (req, res, next) => {
    try {
        const { projectId, milestoneId } = req.params;

        await seda.milestoneConsultantSubmitForReview(
            projectId,
            milestoneId,
            req.user.token
        );

        res.success({
            projectId,
            milestoneId,
            message: 'Milestone submitted for review successfully.'
        });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/milestones/:projectId/:milestoneId/accept
 *
 * Client accepts the delivered milestone work.
 * Mirrors controllers/milestone.js clientAcceptOrRejectSubmittedMilestoneUpdate
 * (accept branch).
 *
 * This transitions the milestone from WaitingClientAcceptSubmission
 * to MilestoneCompleted.
 *
 * Body: { comment? }
 */
router.post('/:projectId/:milestoneId/accept', async (req, res, next) => {
    try {
        const { projectId, milestoneId } = req.params;
        const comment = req.body.comment || '';

        await seda.milestoneClientAcceptSubmission(
            projectId,
            milestoneId,
            comment,
            req.user.token
        );

        res.success({
            projectId,
            milestoneId,
            message: 'Milestone accepted successfully.'
        });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/milestones/:projectId/:milestoneId/reject
 *
 * Client rejects the delivered milestone work.
 * Mirrors controllers/milestone.js clientAcceptOrRejectSubmittedMilestoneUpdate
 * (reject branch).
 *
 * This transitions the milestone from WaitingClientAcceptSubmission
 * to SubmissionRejectedByClient.
 *
 * Body: { comment? }
 */
router.post('/:projectId/:milestoneId/reject', async (req, res, next) => {
    try {
        const { projectId, milestoneId } = req.params;
        const comment = req.body.comment || '';

        await seda.milestoneClientRejectSubmission(
            projectId,
            milestoneId,
            comment,
            req.user.token
        );

        res.success({
            projectId,
            milestoneId,
            message: 'Milestone rejected successfully.'
        });
    } catch (error) {
        next(error);
    }
});


/**
 * GET /api/milestones/:projectId/:milestoneId/history
 *
 * Get the milestone history/logs.
 * Mirrors controllers/milestone.js historyPage.
 *
 * Note: The milestoneLogs SEDA function is not yet adapted
 * for the current backend; it will throw an error until it is.
 * We include it for completeness so the API route is ready.
 */
router.get('/:projectId/:milestoneId/history', async (req, res, next) => {
    try {
        const { projectId, milestoneId } = req.params;

        const project = await seda.project(projectId);
        const milestone = project.milestones.find(m => m.id == milestoneId);

        if (!milestone) {
            const err = new Error('Milestone not found.');
            err.statusCode = 404;
            return next(err);
        }

        // milestoneLogs will throw until adapted, but the route is ready
        let milestoneLogs = [];
        try {
            milestoneLogs = await seda.milestoneLogs(milestoneId);
        } catch (_e) {
            // Logs not yet available in this backend version
        }

        res.success({
            project: { id: project.id, title: project.title },
            milestone,
            milestoneLogs
        });
    } catch (error) {
        next(error);
    }
});


module.exports = router;

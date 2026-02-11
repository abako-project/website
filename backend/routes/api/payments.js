/**
 * Payments API Routes
 *
 * JSON API endpoints for payment operations.
 * These mirror the existing EJS payment controller but return JSON
 * instead of rendering views.
 *
 * The payments page in the EJS app shows all projects for the authenticated
 * user, grouped by milestone payment status (awaiting payment, paid).
 * The advance payment percentage is used to compute partial payments
 * for milestones in progress.
 *
 * All routes require authentication via apiAuth middleware.
 */

const router = require('express').Router();
const seda = require('../../models/seda');
const apiAuth = require('../../middleware/apiAuth');

const advancePaymentPercentage = 25;

// ---------------------------------------------------------------------------
// All routes in this file require authentication
// ---------------------------------------------------------------------------
router.use(apiAuth);


/**
 * GET /api/payments
 *
 * List payment information for the authenticated user.
 * Mirrors controllers/payment.js payments.
 *
 * Returns all projects (with milestones) for the user, plus the
 * advance payment percentage. The frontend computes the per-project
 * and per-milestone payment breakdown, mirroring the EJS template logic
 * in views/payments/__paymentGridProject.ejs.
 *
 * Response shape:
 * {
 *   projects: Project[],
 *   advancePaymentPercentage: number,
 *   allDeliveryTimes: DeliveryTime[]
 * }
 */
router.get('/', async (req, res, next) => {
    try {
        const { clientId, developerId } = req.user;

        if (!clientId && !developerId) {
            return res.error('User has no client or developer profile.', 400);
        }

        const projects = await seda.projectsIndex(
            clientId || null,
            developerId || null
        );

        projects.reverse();

        const allDeliveryTimes = await seda.deliveryTimeIndex();

        res.success({
            projects,
            advancePaymentPercentage,
            allDeliveryTimes
        });
    } catch (error) {
        next(error);
    }
});


/**
 * GET /api/payments/:projectId
 *
 * Get payment details for a specific project.
 * Mirrors controllers/project.js showPayments.
 *
 * Returns the single project (with milestones) plus the advance
 * payment percentage. The frontend uses this for a detail view
 * of a project's payment status.
 *
 * Response shape:
 * {
 *   project: Project,
 *   advancePaymentPercentage: number,
 *   allDeliveryTimes: DeliveryTime[]
 * }
 */
router.get('/:projectId', async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const project = await seda.project(projectId);

        const allDeliveryTimes = await seda.deliveryTimeIndex();

        res.success({
            project,
            advancePaymentPercentage,
            allDeliveryTimes
        });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/payments/:projectId/release
 *
 * Mark the project as completed with ratings and release payment.
 * Mirrors controllers/votes.js submitVotes -> seda.projectCompleted.
 *
 * This is the final step: after all milestones are completed and
 * the consultant rates the developers, the payment is released.
 *
 * Body: { rating: [[toUserId, score], ...] }
 */
router.post('/:projectId/release', async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const rating = req.body.rating || [];

        await seda.projectCompleted(projectId, rating, req.user.token);

        res.success({
            projectId,
            message: 'Payment released successfully.'
        });
    } catch (error) {
        next(error);
    }
});


module.exports = router;

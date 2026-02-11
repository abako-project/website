/**
 * Projects API Routes
 *
 * JSON API endpoints for project CRUD and lifecycle operations.
 * These mirror the existing EJS project controllers but return JSON
 * instead of rendering views or redirecting.
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
 * GET /api/projects
 *
 * List projects for the authenticated user.
 * - If the user is a client, returns that client's projects.
 * - If the user is a developer, returns projects where they are
 *   consultant or assigned developer.
 *
 * Query params (optional):
 *   - clientId: override client filter
 *   - developerId: override developer filter
 */
router.get('/', async (req, res, next) => {
    try {
        // Use explicit query params if provided, otherwise derive from the
        // authenticated user (same logic as controllers/project.js index).
        const clientId = req.query.clientId || req.user.clientId || null;
        const developerId = req.query.developerId || req.user.developerId || null;

        const projects = await seda.projectsIndex(clientId, developerId);

        projects.reverse();

        res.success({ projects });
    } catch (error) {
        next(error);
    }
});


/**
 * GET /api/projects/:id
 *
 * Get a single project with full details (milestones, client, consultant).
 * Mirrors controllers/project.js showInformation.
 */
router.get('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await seda.project(projectId);

        const allBudgets = await seda.budgetIndex();
        const allDeliveryTimes = await seda.deliveryTimeIndex();
        const allProjectTypes = await seda.projectTypeIndex();

        res.success({
            project,
            allBudgets,
            allDeliveryTimes,
            allProjectTypes
        });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/projects
 *
 * Create a new project proposal.
 * Only clients can create proposals. Mirrors controllers/project.js createProposal.
 *
 * Body: { title, summary, description, url, projectType, budget,
 *         deliveryTime, deliveryDate }
 */
router.post('/', async (req, res, next) => {
    try {
        const clientId = req.user.clientId;

        if (!clientId) {
            return res.error('Only clients can create project proposals.', 403);
        }

        let { title, summary, description, url, projectType, budget,
              deliveryTime, deliveryDate } = req.body;

        // Adjust deliveryDate for timezone offset (mirrors EJS controller).
        // The React SPA can send browserTimezoneOffset in the body or we fall
        // back to the session values set during login.
        const browserOffset = req.body.browserTimezoneOffset != null
            ? Number(req.body.browserTimezoneOffset)
            : (req.session.browserTimezoneOffset || 0);
        const serverOffset = req.session.serverTimezoneOffset || 0;

        deliveryDate = new Date(deliveryDate).valueOf() + browserOffset - serverOffset;

        const proposal = {
            title,
            summary,
            description,
            url,
            projectType,
            budget,
            deliveryTime,
            deliveryDate
        };

        const projectId = await seda.proposalCreate(clientId, proposal, req.user.token);

        res.success({ projectId }, 201);
    } catch (error) {
        // Mirror the EJS controller: surface validation errors with details
        if (error instanceof seda.ValidationError) {
            const details = error.errors
                ? error.errors.map(e => e.message)
                : [error.message];
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.details = details;
            return next(err);
        }
        next(error);
    }
});


/**
 * PUT /api/projects/:id
 *
 * Update an existing project proposal.
 * Mirrors controllers/project.js updateProposal.
 *
 * Body: { title, summary, description, url, projectType, budget,
 *         deliveryTime, deliveryDate }
 */
router.put('/:id', async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const { body } = req;

        // Adjust deliveryDate for timezone offset
        const browserOffset = body.browserTimezoneOffset != null
            ? Number(body.browserTimezoneOffset)
            : (req.session.browserTimezoneOffset || 0);
        const serverOffset = req.session.serverTimezoneOffset || 0;

        const proposal = {
            title: body.title,
            summary: body.summary,
            description: body.description,
            url: body.url,
            projectType: body.projectType,
            budget: body.budget,
            deliveryTime: body.deliveryTime,
            deliveryDate: new Date(body.deliveryDate).valueOf() + browserOffset - serverOffset
        };

        await seda.proposalUpdate(projectId, proposal, req.user.token);

        res.success({ projectId });
    } catch (error) {
        if (error instanceof seda.ValidationError) {
            const details = error.errors
                ? error.errors.map(e => e.message)
                : [error.message];
            const err = new Error('Validation failed');
            err.statusCode = 422;
            err.details = details;
            return next(err);
        }
        next(error);
    }
});


/**
 * POST /api/projects/:id/approve
 *
 * Consultant approves a proposal.
 * Mirrors controllers/project.js approveProposal.
 */
router.post('/:id/approve', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        await seda.approveProposal(projectId);

        // Initialise the scope session just like the EJS controller does.
        // This allows the milestone editing flow (which stores draft
        // milestones in the session) to work identically.
        req.session.scope = {
            projectId,
            milestones: []
        };

        // Persist session before responding
        req.session.save((err) => {
            if (err) {
                console.error('[API Projects] Session save error:', err);
                return res.error('Failed to persist session.', 500);
            }
            res.success({ projectId, message: 'Proposal approved successfully.' });
        });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/projects/:id/reject
 *
 * Consultant rejects a proposal.
 * Mirrors controllers/project.js rejectProposal.
 *
 * Body: { proposalRejectionReason }
 */
router.post('/:id/reject', async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const proposalRejectionReason = req.body.proposalRejectionReason || '';

        await seda.rejectProposal(projectId, proposalRejectionReason);

        res.success({ projectId, message: 'Proposal rejected successfully.' });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/projects/:id/scope
 *
 * Consultant submits the scope (milestones) for client validation.
 * Mirrors controllers/project.js scopeSubmit.
 *
 * Body: { consultantComment, milestones? }
 *
 * Milestones are read from req.session.scope (set during the milestone
 * editing flow) unless explicitly provided in the request body.
 */
router.post('/:id/scope', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        const consultantComment = req.body.consultantComment || '';
        const advancePaymentPercentage = 25;
        const documentHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

        // Allow milestones from the body (React SPA) or fall back to session
        // (EJS compatibility), mirroring the EJS controller logic.
        const milestones = req.body.milestones || req.session.scope?.milestones || [];

        // Clean up the session scope draft
        delete req.session.scope;

        await seda.scopeSubmit(
            projectId,
            milestones,
            advancePaymentPercentage,
            documentHash,
            consultantComment,
            req.user.token
        );

        // Persist session after clearing scope
        req.session.save((err) => {
            if (err) {
                console.error('[API Projects] Session save error:', err);
                // The scope was already submitted, so we still return success
            }
            res.success({ projectId, message: 'Scope submitted successfully.' });
        });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/projects/:id/scope/accept
 *
 * Client accepts the scope.
 * Mirrors controllers/project.js scopeAccept.
 *
 * Body: { clientResponse }
 */
router.post('/:id/scope/accept', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        // Fetch the project to get the milestone IDs, exactly as the EJS
        // controller does.
        const project = await seda.project(projectId);
        const milestoneIds = project.milestones.map(milestone => milestone.id);

        const clientResponse = req.body.clientResponse || '';

        await seda.scopeAccept(projectId, milestoneIds, clientResponse, req.user.token);

        res.success({ projectId, message: 'Scope accepted successfully.' });
    } catch (error) {
        next(error);
    }
});


/**
 * POST /api/projects/:id/scope/reject
 *
 * Client rejects the scope.
 * Mirrors controllers/project.js scopeReject.
 *
 * Body: { clientResponse }
 */
router.post('/:id/scope/reject', async (req, res, next) => {
    try {
        const projectId = req.params.id;

        const clientResponse = req.body.clientResponse || '';

        await seda.scopeReject(projectId, clientResponse, req.user.token);

        res.success({ projectId, message: 'Scope rejected successfully.' });
    } catch (error) {
        next(error);
    }
});


module.exports = router;

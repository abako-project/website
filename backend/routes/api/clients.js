/**
 * Clients API Routes
 *
 * JSON API endpoints for client profile management.
 * These mirror the existing EJS client controllers but return JSON
 * instead of rendering views or redirecting.
 *
 * Routes:
 *   GET    /api/clients/:id            - Get client profile
 *   PUT    /api/clients/:id            - Update client profile
 *   POST   /api/clients/:id/attachment - Upload client profile image
 *   GET    /api/clients/:id/attachment - Get client profile image
 *
 * All routes require authentication via apiAuth middleware.
 */

const router = require('express').Router();
const multer = require('multer');
const seda = require('../../models/seda');
const apiAuth = require('../../middleware/apiAuth');

const languagesMap = require('../../models/enums/languages.json');

// Configure multer for memory storage (same as EJS routes)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }
});


// ---------------------------------------------------------------------------
// All routes in this file require authentication
// ---------------------------------------------------------------------------
router.use(apiAuth);


/**
 * GET /api/clients/:id
 *
 * Get a client profile by ID.
 * Mirrors controllers/client.js show action.
 *
 * Returns the client data plus resolved language names.
 */
router.get('/:id', async (req, res, next) => {
    try {
        const clientId = req.params.id;
        const client = await seda.client(clientId);

        // Resolve language codes to names, mirroring the EJS controller
        const languageNames = client.languages?.map(code => languagesMap[code]).filter(Boolean) || [];

        // Build the avatar URL (same pattern as the EJS show view)
        const avatarUrl = `/api/clients/${client.id}/attachment`;

        res.success({
            client,
            avatarUrl,
            languageNames
        });
    } catch (error) {
        next(error);
    }
});


/**
 * PUT /api/clients/:id
 *
 * Update a client profile.
 * Mirrors controllers/client.js update action.
 * Accepts multipart/form-data (for image upload) or JSON body.
 *
 * Body fields: name, company, department, website, description, location, languages
 * File field: image (optional profile picture)
 */
router.put('/:id', upload.single('image'), async (req, res, next) => {
    try {
        const clientId = req.params.id;
        const { body } = req;

        // Build the data object mirroring the EJS controller exactly
        const data = {
            name: body.name || 'name',
            company: body.company || 'company',
            department: body.department || 'department',
            website: body.website || 'website',
            description: body.description || 'description',
            location: body.location || 'location',
        };

        // Handle languages array (may come as JSON array or form array)
        if (typeof body.languages === 'string') {
            try {
                data.languages = JSON.parse(body.languages);
            } catch (_e) {
                data.languages = [body.languages];
            }
        } else {
            data.languages = Array.isArray(body.languages) ? body.languages : body.languages ? [body.languages] : ['none'];
        }

        const image = req.file?.buffer || null;

        await seda.clientUpdate(clientId, data, image);

        // Fetch the updated client to return
        const updatedClient = await seda.client(clientId);
        const languageNames = updatedClient.languages?.map(code => languagesMap[code]).filter(Boolean) || [];

        console.log('Client edited successfully via API.');
        res.success({
            client: updatedClient,
            languageNames
        });
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
 * POST /api/clients/:id/attachment
 *
 * Upload a client profile image.
 * This is a convenience endpoint for uploading just the image
 * without updating other profile fields.
 *
 * File field: image
 */
router.post('/:id/attachment', upload.single('image'), async (req, res, next) => {
    try {
        const clientId = req.params.id;
        const image = req.file?.buffer || null;

        if (!image) {
            return res.error('No image file provided.', 400);
        }

        // Update the client with only the image (pass empty data object
        // to avoid overwriting profile fields)
        const client = await seda.client(clientId);
        const data = {
            name: client.name,
            company: client.company || 'company',
            department: client.department || 'department',
            website: client.website || 'website',
            description: client.description || 'description',
            location: client.location || 'location',
            languages: client.languages || ['none'],
        };

        await seda.clientUpdate(clientId, data, image);

        console.log('Client image uploaded successfully via API.');
        res.success({ message: 'Image uploaded successfully.' });
    } catch (error) {
        next(error);
    }
});


/**
 * GET /api/clients/:id/attachment
 *
 * Get a client profile image.
 * Mirrors controllers/client.js attachment action.
 *
 * Returns the image binary with the correct MIME type,
 * or redirects to a default image if none exists.
 */
router.get('/:id/attachment', async (req, res, next) => {
    try {
        const clientId = req.params.id;
        const attachment = await seda.clientAttachment(clientId);

        if (!attachment || !attachment.image) {
            return res.redirect('/images/none.png');
        }

        res.type(attachment.mime);
        res.send(Buffer.from(attachment.image));
    } catch (error) {
        next(error);
    }
});


module.exports = router;

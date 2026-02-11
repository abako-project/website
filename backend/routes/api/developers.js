/**
 * Developers API Routes
 *
 * JSON API endpoints for developer profile management.
 * These mirror the existing EJS developer controllers but return JSON
 * instead of rendering views or redirecting.
 *
 * Routes:
 *   GET    /api/developers/:id            - Get developer profile
 *   PUT    /api/developers/:id            - Update developer profile
 *   POST   /api/developers/:id/attachment - Upload developer profile image
 *   GET    /api/developers/:id/attachment - Get developer profile image
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
 * GET /api/developers/:id
 *
 * Get a developer profile by ID.
 * Mirrors controllers/developer.js show action.
 *
 * Returns the developer data plus resolved language names.
 */
router.get('/:id', async (req, res, next) => {
    try {
        const developerId = req.params.id;
        const developer = await seda.developer(developerId);

        // Resolve language codes to names, mirroring the EJS controller
        const languageNames = developer.languages?.map(code => languagesMap[code]).filter(Boolean) || [];

        // Build the avatar URL (same pattern as the EJS show view)
        const avatarUrl = `/api/developers/${developer.id}/attachment`;

        res.success({
            developer,
            avatarUrl,
            languageNames
        });
    } catch (error) {
        next(error);
    }
});


/**
 * PUT /api/developers/:id
 *
 * Update a developer profile.
 * Mirrors controllers/developer.js update action.
 * Accepts multipart/form-data (for image upload) or JSON body.
 *
 * Body fields: name, bio, background, role, proficiency, githubUsername,
 *              portfolioUrl, location, skills, languages,
 *              isAvailableForHire, availability, availableHoursPerWeek
 * File field: image (optional profile picture)
 */
router.put('/:id', upload.single('image'), async (req, res, next) => {
    try {
        const developerId = req.params.id;
        const developer = await seda.developer(developerId);
        const body = req.body;

        // Build the data object mirroring the EJS controller exactly
        const data = {
            name: body.name || 'name',
            githubUsername: body.githubUsername || 'githubUsername',
            portfolioUrl: body.portfolioUrl || 'portfolioUrl',
            bio: body.bio || 'bio',
            background: body.background || 'background',
            role: body.role || null,
            location: body.location || 'location',
            proficiency: body.proficiency || null,
        };

        // Handle skills array (may come as JSON string or form array)
        if (typeof body.skills === 'string') {
            try {
                data.skills = JSON.parse(body.skills);
            } catch (_e) {
                data.skills = [body.skills];
            }
        } else {
            data.skills = Array.isArray(body.skills) ? body.skills : body.skills ? [body.skills] : ['none'];
        }

        // Handle languages array (may come as JSON string or form array)
        if (typeof body.languages === 'string') {
            try {
                data.languages = JSON.parse(body.languages);
            } catch (_e) {
                data.languages = [body.languages];
            }
        } else {
            data.languages = Array.isArray(body.languages) ? body.languages : body.languages ? [body.languages] : ['none'];
        }

        // Handle availability mirroring the EJS controller exactly
        // When sent from the React SPA, isAvailableForHire comes as a string or boolean
        const isAvailable = body.isAvailableForHire === true
            || body.isAvailableForHire === 'true'
            || body.isAvailableForHire === '1'
            || body.isAvailableForHire === 1;

        if (!isAvailable) {
            data.availability = 'NotAvailable';
        } else {
            data.availability = body.availability;
            if (body.availability === 'WeeklyHours') {
                data.availableHoursPerWeek = parseInt(body.availableHoursPerWeek || '0');
            }
        }

        const image = req.file?.buffer || null;

        // Register the worker in Calendar (mirrors EJS controller)
        await seda.registerWorker(developer.email, req.user.token);

        // Set availability (mirrors EJS controller)
        await seda.setAvailability(data.availability, data.availableHoursPerWeek, req.user.token);

        // Update the profile
        await seda.developerUpdate(developerId, data, image);

        // Fetch the updated developer to return
        const updatedDeveloper = await seda.developer(developerId);
        const languageNames = updatedDeveloper.languages?.map(code => languagesMap[code]).filter(Boolean) || [];

        console.log('Developer edited successfully via API.');
        res.success({
            developer: updatedDeveloper,
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
 * POST /api/developers/:id/attachment
 *
 * Upload a developer profile image.
 * This is a convenience endpoint for uploading just the image
 * without updating other profile fields.
 *
 * File field: image
 */
router.post('/:id/attachment', upload.single('image'), async (req, res, next) => {
    try {
        const developerId = req.params.id;
        const image = req.file?.buffer || null;

        if (!image) {
            return res.error('No image file provided.', 400);
        }

        // Fetch the current developer to preserve all existing fields
        const developer = await seda.developer(developerId);
        const data = {
            name: developer.name,
            githubUsername: developer.githubUsername || 'githubUsername',
            portfolioUrl: developer.portfolioUrl || 'portfolioUrl',
            bio: developer.bio || 'bio',
            background: developer.background || 'background',
            role: developer.role || null,
            location: developer.location || 'location',
            proficiency: developer.proficiency || null,
            skills: developer.skills || ['none'],
            languages: developer.languages || ['none'],
            availability: developer.availability || 'NotAvailable',
        };

        await seda.developerUpdate(developerId, data, image);

        console.log('Developer image uploaded successfully via API.');
        res.success({ message: 'Image uploaded successfully.' });
    } catch (error) {
        next(error);
    }
});


/**
 * GET /api/developers/:id/attachment
 *
 * Get a developer profile image.
 * Mirrors controllers/developer.js attachment action.
 *
 * Returns the image binary with the correct MIME type,
 * or redirects to a default image if none exists.
 */
router.get('/:id/attachment', async (req, res, next) => {
    try {
        const developerId = req.params.id;
        const attachment = await seda.developerAttachment(developerId);

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

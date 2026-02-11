/**
 * Enums API Routes
 *
 * Serves the static enum/reference data used by forms and UI components.
 * These JSON files are already on disk; this endpoint aggregates them
 * into a single response so the React SPA can fetch all enums in one call.
 */

const router = require('express').Router();
const path = require('path');

// Load enum data at module init (these are static JSON files that do not change at runtime)
const enumsDir = path.join(__dirname, '../../models/enums');

const budgets = require(path.join(enumsDir, 'budgets.json'));
const deliveryTimes = require(path.join(enumsDir, 'deliveryTimes.json'));
const projectTypes = require(path.join(enumsDir, 'projectTypes.json'));
const skills = require(path.join(enumsDir, 'skills.json'));
const roles = require(path.join(enumsDir, 'roles.json'));
const availability = require(path.join(enumsDir, 'availability.json'));
const languages = require(path.join(enumsDir, 'languages.json'));
const proficiency = require(path.join(enumsDir, 'proficiency.json'));


/**
 * GET /api/enums
 *
 * Returns all enum data in a single response.
 * This is a public endpoint (no authentication required) because
 * enum data is non-sensitive reference data needed by forms.
 */
router.get('/', (req, res) => {
    res.json({
        budgets,
        deliveryTimes,
        projectTypes,
        skills,
        roles,
        availability,
        languages,
        proficiency
    });
});


/**
 * GET /api/enums/budgets
 */
router.get('/budgets', (req, res) => {
    res.json(budgets);
});

/**
 * GET /api/enums/delivery-times
 */
router.get('/delivery-times', (req, res) => {
    res.json(deliveryTimes);
});

/**
 * GET /api/enums/project-types
 */
router.get('/project-types', (req, res) => {
    res.json(projectTypes);
});

/**
 * GET /api/enums/skills
 */
router.get('/skills', (req, res) => {
    res.json(skills);
});

/**
 * GET /api/enums/roles
 */
router.get('/roles', (req, res) => {
    res.json(roles);
});

/**
 * GET /api/enums/availability
 */
router.get('/availability', (req, res) => {
    res.json(availability);
});

/**
 * GET /api/enums/languages
 */
router.get('/languages', (req, res) => {
    res.json(languages);
});

/**
 * GET /api/enums/proficiency
 */
router.get('/proficiency', (req, res) => {
    res.json(proficiency);
});


module.exports = router;

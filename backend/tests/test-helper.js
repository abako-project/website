/**
 * Test Helper - Utilities for E2E Testing without Browser WebAuthn
 *
 * This module provides utilities to run E2E tests against the adapter-api
 * without requiring actual WebAuthn browser credentials.
 *
 * Strategy:
 * 1. For operations that don't require authentication -> Use api-client directly
 * 2. For authenticated operations -> Use dev backend's test token endpoint or mock token
 * 3. For full integration -> Use the backend's internal auth flow
 */

const { adapterAPI, virtoAPI, contractsAPI } = require('../services/api-client');
const apiConfig = require('../config/api.config');

// Test configuration
const TEST_CONFIG = {
    baseURL: apiConfig.baseURL,
    timestamp: Date.now(),
    timeout: 30000,
    verbose: process.env.VERBOSE === 'true'
};

// Console colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

/**
 * Logger utility
 */
const logger = {
    log: (msg, color = colors.reset) => console.log(`${color}${msg}${colors.reset}`),
    info: (msg) => logger.log(`ℹ ${msg}`, colors.blue),
    success: (msg) => logger.log(`✓ ${msg}`, colors.green),
    error: (msg) => logger.log(`✗ ${msg}`, colors.red),
    warn: (msg) => logger.log(`⚠ ${msg}`, colors.yellow),
    section: (title) => {
        logger.log(`\n${'='.repeat(60)}`, colors.cyan);
        logger.log(`  ${title}`, colors.bright + colors.cyan);
        logger.log('='.repeat(60), colors.cyan);
    }
};

/**
 * Test results tracker
 */
class TestTracker {
    constructor() {
        this.reset();
    }

    reset() {
        this.total = 0;
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
        this.errors = [];
    }

    pass(testName, details = '') {
        this.total++;
        this.passed++;
        logger.log(`  ✓ ${testName}`, colors.green);
        if (TEST_CONFIG.verbose && details) {
            logger.log(`    ${details}`, colors.blue);
        }
    }

    fail(testName, error) {
        this.total++;
        this.failed++;
        logger.log(`  ✗ ${testName}`, colors.red);
        logger.log(`    ${error}`, colors.red);
        this.errors.push({ test: testName, error });
    }

    skip(testName, reason = '') {
        this.total++;
        this.skipped++;
        logger.log(`  ⊘ ${testName}${reason ? ` (${reason})` : ''}`, colors.yellow);
    }

    summary() {
        logger.section('Test Summary');
        logger.log(`  Total:    ${this.total}`, colors.bright);
        logger.log(`  Passed:   ${this.passed}`, colors.green);
        logger.log(`  Failed:   ${this.failed}`, this.failed > 0 ? colors.red : colors.green);
        logger.log(`  Skipped:  ${this.skipped}`, colors.yellow);

        const successRate = this.total > 0 ? ((this.passed / this.total) * 100).toFixed(1) : 0;
        logger.log(`  Rate:     ${successRate}%`, successRate >= 80 ? colors.green : colors.red);

        return this.failed === 0;
    }
}

/**
 * Test User Factory
 * Creates test users with unique identifiers
 */
class TestUserFactory {
    constructor(prefix = 'test') {
        this.prefix = prefix;
        this.timestamp = TEST_CONFIG.timestamp;
    }

    createClient(index = 1) {
        return {
            email: `${this.prefix}-client-${index}-${this.timestamp}@example.com`,
            name: `Test Client ${index}`,
            company: 'Test Company',
            department: 'Engineering',
            website: 'https://test.com',
            description: 'Test client for E2E testing',
            location: 'Test City'
        };
    }

    createDeveloper(index = 1) {
        return {
            email: `${this.prefix}-dev-${index}-${this.timestamp}@example.com`,
            name: `Test Developer ${index}`,
            githubUsername: `testdev${index}`,
            portfolioUrl: `https://portfolio${index}.test.com`
        };
    }

    createProject(clientId) {
        return {
            title: `Test Project ${this.timestamp}`,
            summary: 'E2E test project summary',
            description: 'Detailed description for E2E test project',
            projectTypeId: 1,
            url: 'https://test-project.com',
            budgetId: 1,
            deliveryTimeId: 1,
            deliveryDate: '2025-12-31',
            clientId
        };
    }

    createMilestone(index = 1) {
        return {
            title: `Milestone ${index}`,
            description: `Description for milestone ${index}`,
            budget: 5000 * index,
            deliveryTimeId: 1,
            deliveryDate: '2025-12-31'
        };
    }
}

/**
 * Authentication Helper
 * Manages test authentication tokens
 *
 * Since virto-sdk requires browser WebAuthn, we provide alternatives:
 * 1. Use a pre-configured test token from environment
 * 2. Use the backend's development/test mode endpoints
 * 3. Skip auth-required tests when no token is available
 */
class AuthHelper {
    constructor() {
        this.tokens = new Map();
        this.addresses = new Map();
    }

    /**
     * Get a test token for a user
     * In a real scenario, this would use the authentication flow
     * For tests, we use environment tokens or skip auth tests
     */
    async getToken(userId) {
        // Check cache
        if (this.tokens.has(userId)) {
            return this.tokens.get(userId);
        }

        // Check environment variable
        const envToken = process.env.TEST_TOKEN;
        if (envToken) {
            this.tokens.set(userId, envToken);
            return envToken;
        }

        // Try to get token from dev backend (if it supports test mode)
        try {
            const response = await virtoAPI.customConnect({ userId });
            if (response.token) {
                this.tokens.set(userId, response.token);
                return response.token;
            }
        } catch (error) {
            // Expected to fail without proper WebAuthn credentials
            logger.warn(`No auth token available for ${userId}: ${error.message}`);
        }

        return null;
    }

    /**
     * Get user's blockchain address
     */
    async getAddress(userId) {
        if (this.addresses.has(userId)) {
            return this.addresses.get(userId);
        }

        try {
            const response = await virtoAPI.getUserAddress(userId);
            if (response.address) {
                this.addresses.set(userId, response.address);
                return response.address;
            }
        } catch (error) {
            // User may not exist yet
        }

        return null;
    }

    /**
     * Check if user is registered
     */
    async isRegistered(userId) {
        try {
            const response = await adapterAPI.checkRegistered(userId);
            return response.registered === true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Clear cached tokens and addresses
     */
    clear() {
        this.tokens.clear();
        this.addresses.clear();
    }
}

/**
 * API Test Runner
 * Provides a clean interface for running API tests with proper error handling
 */
class TestRunner {
    constructor() {
        this.tracker = new TestTracker();
        this.auth = new AuthHelper();
        this.users = new TestUserFactory();
    }

    /**
     * Run a test with automatic result tracking
     */
    async run(testName, testFn, options = {}) {
        const { requiresAuth = false, skip = false, skipReason = '' } = options;

        if (skip) {
            this.tracker.skip(testName, skipReason);
            return { skipped: true };
        }

        try {
            const result = await testFn();

            // Handle explicit skip from test function
            if (result && result.skip) {
                this.tracker.skip(testName, result.reason || '');
                return { skipped: true };
            }

            this.tracker.pass(testName, TEST_CONFIG.verbose ? JSON.stringify(result).substring(0, 100) : '');
            return { success: true, data: result };

        } catch (error) {
            // Handle auth errors gracefully
            if (requiresAuth && (error.statusCode === 401 || error.statusCode === 403)) {
                this.tracker.skip(testName, 'Authentication required');
                return { skipped: true, authRequired: true };
            }

            this.tracker.fail(testName, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Run tests sequentially
     */
    async runSequence(tests) {
        const results = {};
        for (const { name, fn, options } of tests) {
            results[name] = await this.run(name, fn, options);
        }
        return results;
    }

    /**
     * Print test summary and return exit code
     */
    summary() {
        const success = this.tracker.summary();
        return success ? 0 : 1;
    }

    /**
     * Reset test state
     */
    reset() {
        this.tracker.reset();
        this.auth.clear();
    }
}

/**
 * State container for test data across test phases
 */
class TestState {
    constructor() {
        this.clients = [];
        this.developers = [];
        this.projects = [];
        this.milestones = [];
        this.calendarAddress = null;
        this.tokens = {};
    }

    addClient(client) {
        this.clients.push(client);
        return client;
    }

    addDeveloper(developer) {
        this.developers.push(developer);
        return developer;
    }

    addProject(project) {
        this.projects.push(project);
        return project;
    }

    get latestClient() {
        return this.clients[this.clients.length - 1];
    }

    get latestDeveloper() {
        return this.developers[this.developers.length - 1];
    }

    get latestProject() {
        return this.projects[this.projects.length - 1];
    }
}

// Export utilities
module.exports = {
    // Classes
    TestRunner,
    TestTracker,
    TestUserFactory,
    AuthHelper,
    TestState,

    // Instances (for convenience)
    runner: new TestRunner(),
    state: new TestState(),

    // Config and utils
    TEST_CONFIG,
    colors,
    logger,

    // Direct API access
    adapterAPI,
    virtoAPI,
    contractsAPI
};

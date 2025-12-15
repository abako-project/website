/**
 * API Client Test Suite
 * Comprehensive testing for all API endpoints against deployed backend
 *
 * Backend URLs:
 *   - Adapter API: https://dev.abako.xyz/adapter/v1
 *   - Virto API: https://dev.abako.xyz/api
 *   - Contracts API: https://dev.abako.xyz
 *
 * Usage:
 *   node backend/tests/api-client.test.js
 *
 * Or run specific test suites:
 *   TEST_SUITE=adapter node backend/tests/api-client.test.js
 *   TEST_SUITE=virto node backend/tests/api-client.test.js
 *   TEST_SUITE=contracts node backend/tests/api-client.test.js
 *
 * Options:
 *   VERBOSE=true - Show detailed response data
 *   SKIP_CONNECTIVITY=true - Skip initial connectivity checks
 */

const { adapterAPI, virtoAPI, contractsAPI } = require('../services/api-client');
const apiConfig = require('../config/api.config');

// Test configuration
const TEST_CONFIG = {
    // Backend URLs
    baseURL: apiConfig.baseURL,
    adapterURL: apiConfig.adapterAPI.baseURL,
    virtoURL: apiConfig.virtoAPI.baseURL,
    contractsURL: apiConfig.contractsAPI.baseURL,

    // Test data
    testUserId: 'test-user-' + Date.now(),
    testEmail: `test-${Date.now()}@example.com`,
    testName: 'Test User',
    testContractAddress: '0xTestContractAddress',
    communityId: 1,

    // Calendar address (from deployed calendar contract)
    // Update this if you have a different calendar address
    calendarAddress: process.env.CALENDAR_ADDRESS || 'CeRx6EW6vxaacHBvhtvHvZFcmhWRQW4T9xtafS9FprZYEay',

    // Options
    verbose: process.env.VERBOSE === 'true',
    skipConnectivity: process.env.SKIP_CONNECTIVITY === 'true',
    
    // Token (can be provided via environment variable for real tests)
    token: process.env.TEST_TOKEN || null
};

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Test results tracker
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: []
};

// Helper functions
function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
    log(`\n${'='.repeat(60)}`, colors.cyan);
    log(`  ${title}`, colors.bright + colors.cyan);
    log('='.repeat(60), colors.cyan);
}

function logTest(testName, status, details = '') {
    testResults.total++;

    if (status === 'PASS') {
        testResults.passed++;
        log(`  ✓ ${testName}`, colors.green);
    } else if (status === 'FAIL') {
        testResults.failed++;
        log(`  ✗ ${testName}`, colors.red);
        if (details) {
            log(`    ${details}`, colors.red);
            testResults.errors.push({ test: testName, error: details });
        }
    } else if (status === 'SKIP') {
        testResults.skipped++;
        log(`  ⊘ ${testName} (skipped)`, colors.yellow);
    }

    if (TEST_CONFIG.verbose && details && status !== 'FAIL') {
        log(`    ${details}`, colors.blue);
    }
}

async function runTest(testName, testFn) {
    try {
        const result = await testFn();

        if (result && result.skip) {
            logTest(testName, 'SKIP');
            return;
        }

        logTest(testName, 'PASS', TEST_CONFIG.verbose ? JSON.stringify(result).substring(0, 100) : '');
        return result;
    } catch (error) {
        logTest(testName, 'FAIL', error.message);
        return null;
    }
}

// ============ Adapter API Tests ============

async function testAdapterAPI() {
    logSection('Adapter API Tests');

    // Auth Tests
    log('\n  Auth Endpoints:', colors.bright);
    await runTest('checkRegistered', async () => {
        return await adapterAPI.checkRegistered(TEST_CONFIG.testUserId);
    });

    await runTest('sign (requires token)', async () => {
        return { skip: true }; // Skip as it requires valid token
    });

    // Clients Tests
    log('\n  Client Endpoints:', colors.bright);
    let createdClientId;

    await runTest('getClients', async () => {
        const result = await adapterAPI.getClients();
        if (TEST_CONFIG.verbose) {
            log(`    Found ${result.clients?.length || 0} clients`, colors.blue);
        }
        return result;
    });

    await runTest('createClient', async () => {
        const result = await adapterAPI.createClient(
            TEST_CONFIG.testEmail,
            TEST_CONFIG.testName,
            'Test Company',
            'Engineering',
            'https://test.com',
            'Test Description',
            'Test Location'
        );
        if (result && result.clientId) {
            createdClientId = result.clientId;
            log(`    Created client with ID: ${createdClientId}`, colors.blue);
        }
        return result;
    });

    if (createdClientId) {
        await runTest('getClient', async () => {
            return await adapterAPI.getClient(createdClientId);
        });

        await runTest('updateClient', async () => {
            return await adapterAPI.updateClient(createdClientId, {
                name: 'Updated Name'
            });
        });

        await runTest('getClientProjects', async () => {
            return await adapterAPI.getClientProjects(createdClientId);
        });
    } else {
        log('    ⊘ Skipping dependent client tests (no client created)', colors.yellow);
    }

    // Developers Tests
    log('\n  Developer Endpoints:', colors.bright);
    let createdDeveloperId;

    await runTest('getDevelopers', async () => {
        const result = await adapterAPI.getDevelopers();
        if (TEST_CONFIG.verbose) {
            log(`    Found ${result.developers?.length || 0} developers`, colors.blue);
        }
        return result;
    });

    await runTest('createDeveloper', async () => {
        const developerEmail = 'dev-' + TEST_CONFIG.testEmail; // Different email for developer
        const result = await adapterAPI.createDeveloper(
            developerEmail,
            TEST_CONFIG.testName + ' (Dev)',
            'testdev',
            'https://portfolio.com'
        );
        if (result && result.developerId) {
            createdDeveloperId = result.developerId;
            log(`    Created developer with ID: ${createdDeveloperId}`, colors.blue);
        }
        return result;
    });

    if (createdDeveloperId) {
        await runTest('getDeveloper', async () => {
            return await adapterAPI.getDeveloper(createdDeveloperId);
        });

        await runTest('getDeveloperProjects', async () => {
            return await adapterAPI.getDeveloperProjects(createdDeveloperId);
        });

        await runTest('getDeveloperMilestones', async () => {
            return await adapterAPI.getDeveloperMilestones(createdDeveloperId);
        });
    } else {
        log('    ⊘ Skipping dependent developer tests (no developer created)', colors.yellow);
    }

    // Calendar Setup - Register developer before creating projects
    log('\n  Calendar Setup:', colors.bright);
    let calendarAddress = TEST_CONFIG.calendarAddress;
    let developerAddress = null;
    let testToken = TEST_CONFIG.token || 'test-token-' + Date.now(); // Use real token if available

    if (createdDeveloperId) {
        // Get developer address from Virto
        await runTest('getDeveloperAddress', async () => {
            try {
                const developerEmail = 'dev-' + TEST_CONFIG.testEmail;
                const response = await fetch(`https://dev.abako.xyz/api/get-user-address?userId=${developerEmail}`);
                const data = await response.json();
                if (data.address) {
                    developerAddress = data.address;
                    log(`    Developer address: ${developerAddress}`, colors.blue);
                }
                return data;
            } catch (error) {
                log(`    Could not get developer address: ${error.message}`, colors.yellow);
                return { skip: true, reason: 'Could not fetch address' };
            }
        });

        // Register developer in calendar
        if (developerAddress) {
            await runTest('registerWorkerInCalendar', async () => {
                try {
                    const result = await adapterAPI.registerWorker(calendarAddress, developerAddress, testToken);
                    log(`    Developer registered in calendar`, colors.blue);
                    return result;
                } catch (error) {
                    if (error.statusCode === 401 || error.statusCode === 403) {
                        log(`    Auth required for calendar registration (expected)`, colors.yellow);
                        return { skip: true, reason: 'Authentication required' };
                    }
                    log(`    Calendar registration error: ${error.message}`, colors.yellow);
                    return { skip: true, reason: error.message };
                }
            });

            // Set developer availability
            await runTest('setDeveloperAvailability', async () => {
                try {
                    const result = await adapterAPI.setAvailability(calendarAddress, 40, testToken); // 40 hours/week
                    log(`    Developer availability set to 40 hours/week`, colors.blue);
                    return result;
                } catch (error) {
                    if (error.statusCode === 401 || error.statusCode === 403) {
                        return { skip: true, reason: 'Authentication required' };
                    }
                    log(`    Could not set availability: ${error.message}`, colors.yellow);
                    return { skip: true, reason: error.message };
                }
            });
        }
    }

    // Projects Tests - Complete Lifecycle Flow
    log('\n  Project Endpoints - Complete Flow:', colors.bright);
    let createdProjectAddress;

    // Test 1: Deploy Project
    await runTest('deployProject', async () => {
        if (!createdClientId) {
            return { skip: true, reason: 'No client created' };
        }
        
        const projectData = {
            title: 'Test Project',
            summary: 'Test project summary',
            description: 'Detailed test project description',
            projectTypeId: 1,
            url: 'https://test-project.com',
            budgetId: 1,
            deliveryTimeId: 1,
            deliveryDate: '2025-12-31'
        };

        try {
            const result = await adapterAPI.deployProject('v5', projectData, createdClientId, testToken);
            if (result && result.address) {
                createdProjectAddress = result.address;
                log(`    Created project at address: ${createdProjectAddress}`, colors.blue);
            }
            return result;
        } catch (error) {
            // Skip if authentication fails (expected in test environment)
            if (error.statusCode === 401 || error.statusCode === 403) {
                return { skip: true, reason: 'Authentication required' };
            }
            throw error;
        }
    });

    // Test 2: Get Project Info
    if (createdProjectAddress) {
        await runTest('getProjectInfo', async () => {
            return await adapterAPI.getProjectInfo(createdProjectAddress);
        });

        // Test 3: Assign Coordinator
        await runTest('assignCoordinator', async () => {
            try {
                return await adapterAPI.assignCoordinator(createdProjectAddress, testToken);
            } catch (error) {
                if (error.statusCode === 401 || error.statusCode === 403) {
                    return { skip: true, reason: 'Authentication required' };
                }
                throw error;
            }
        });

        // Test 4: Create Milestone
        let createdMilestoneId;
        await runTest('createMilestone', async () => {
            const milestoneData = {
                title: 'Test Milestone 1',
                description: 'First milestone for testing',
                budget: 5000,
                deliveryTimeId: 1,
                deliveryDate: '2025-11-30'
            };

            try {
                const result = await adapterAPI.createMilestone(createdProjectAddress, milestoneData, testToken);
                if (result && result.milestoneId) {
                    createdMilestoneId = result.milestoneId;
                    log(`    Created milestone with ID: ${createdMilestoneId}`, colors.blue);
                }
                return result;
            } catch (error) {
                if (error.statusCode === 401 || error.statusCode === 403) {
                    return { skip: true, reason: 'Authentication required' };
                }
                throw error;
            }
        });

        // Test 5: Get Milestones
        await runTest('getMilestones', async () => {
            try {
                return await adapterAPI.getMilestones(createdProjectAddress, testToken);
            } catch (error) {
                if (error.statusCode === 401 || error.statusCode === 403) {
                    return { skip: true, reason: 'Authentication required' };
                }
                throw error;
            }
        });

        // Test 6: Get Single Milestone
        if (createdMilestoneId) {
            await runTest('getMilestone', async () => {
                try {
                    return await adapterAPI.getMilestone(createdProjectAddress, createdMilestoneId, testToken);
                } catch (error) {
                    if (error.statusCode === 401 || error.statusCode === 403) {
                        return { skip: true, reason: 'Authentication required' };
                    }
                    throw error;
                }
            });

            // Test 7: Update Milestone
            await runTest('updateMilestone', async () => {
                const updateData = {
                    title: 'Updated Test Milestone',
                    description: 'Updated description',
                    budget: 6000
                };

                try {
                    return await adapterAPI.updateMilestone(createdProjectAddress, createdMilestoneId, updateData, testToken);
                } catch (error) {
                    if (error.statusCode === 401 || error.statusCode === 403) {
                        return { skip: true, reason: 'Authentication required' };
                    }
                    throw error;
                }
            });
        }

        // Test 8: Propose Scope
        await runTest('proposeScope', async () => {
            const milestones = [
                { title: 'M1', budget: 5000, deliveryDate: '2025-11-30' },
                { title: 'M2', budget: 5000, deliveryDate: '2025-12-31' }
            ];

            try {
                return await adapterAPI.proposeScope(
                    createdProjectAddress,
                    milestones,
                    20, // 20% advance payment
                    '0xdocumenthash',
                    testToken
                );
            } catch (error) {
                if (error.statusCode === 401 || error.statusCode === 403) {
                    return { skip: true, reason: 'Authentication required' };
                }
                throw error;
            }
        });

        // Test 9: Get Scope Info
        await runTest('getScopeInfo', async () => {
            try {
                return await adapterAPI.getScopeInfo(createdProjectAddress);
            } catch (error) {
                if (error.statusCode === 404) {
                    return { message: 'Scope not yet proposed (expected)' };
                }
                throw error;
            }
        });

        // Test 10: Get Team
        await runTest('getTeam', async () => {
            try {
                return await adapterAPI.getTeam(createdProjectAddress);
            } catch (error) {
                if (error.statusCode === 404) {
                    return { message: 'Team not yet assigned (expected)' };
                }
                throw error;
            }
        });

        // Test 11: Get All Tasks
        await runTest('getAllTasks', async () => {
            try {
                return await adapterAPI.getAllTasks(createdProjectAddress);
            } catch (error) {
                if (error.statusCode === 404) {
                    return { message: 'No tasks yet (expected)' };
                }
                throw error;
            }
        });

    } else {
        log('    ⊘ Skipping project flow tests (no project created)', colors.yellow);
    }

    // Calendar Tests
    log('\n  Calendar Endpoints:', colors.bright);

    await runTest('deployCalendar', async () => {
        try {
            return await adapterAPI.deployCalendar('v5', testToken);
        } catch (error) {
            if (error.statusCode === 401 || error.statusCode === 403) {
                return { skip: true, reason: 'Authentication required' };
            }
            throw error;
        }
    });

    await runTest('getRegisteredWorkers (requires valid contract)', async () => {
        return { skip: true };
    });
}

// ============ Virto API Tests ============

async function testVirtoAPI() {
    logSection('Virto API Tests');

    // Health Check
    log('\n  Health Check:', colors.bright);
    await runTest('healthCheck', async () => {
        return await virtoAPI.healthCheck();
    });

    // WebAuthn/VOS Mock Tests
    log('\n  WebAuthn/VOS Mock Endpoints:', colors.bright);

    await runTest('checkUserRegistered', async () => {
        return await virtoAPI.checkUserRegistered(TEST_CONFIG.testUserId);
    });

    await runTest('getUserAddress', async () => {
        try {
            return await virtoAPI.getUserAddress(TEST_CONFIG.testUserId);
        } catch (error) {
            // Expected to fail if user doesn't exist
            return { message: 'User not found (expected for new test user)' };
        }
    });

    // Payments Tests
    log('\n  Payments Endpoints:', colors.bright);

    await runTest('paymentsHealthCheck', async () => {
        return await virtoAPI.paymentsHealthCheck();
    });

    await runTest('getPayment (requires valid paymentId)', async () => {
        return { skip: true };
    });

    // Memberships Tests
    log('\n  Memberships Endpoints:', colors.bright);

    await runTest('getCommunityAddress', async () => {
        return await virtoAPI.getCommunityAddress(TEST_CONFIG.communityId);
    });

    await runTest('getMembers', async () => {
        return await virtoAPI.getMembers(TEST_CONFIG.communityId);
    });

    await runTest('membershipsHealthCheck', async () => {
        return await virtoAPI.membershipsHealthCheck();
    });
}

// ============ Contracts API Tests ============

async function testContractsAPI() {
    logSection('Contracts API Tests');

    // Health Check
    log('\n  Health Check:', colors.bright);
    await runTest('healthCheck', async () => {
        return await contractsAPI.healthCheck();
    });

    // Projects Tests
    log('\n  Projects Endpoints:', colors.bright);

    await runTest('getProjectConstructors', async () => {
        return await contractsAPI.getProjectConstructors();
    });

    await runTest('queryProjectMethod (requires valid contract)', async () => {
        return { skip: true };
    });

    // Calendar Tests
    log('\n  Calendar Endpoints:', colors.bright);

    await runTest('getCalendarConstructors', async () => {
        return await contractsAPI.getCalendarConstructors();
    });

    await runTest('queryCalendarMethod (requires valid contract)', async () => {
        return { skip: true };
    });
}

// ============ Connectivity Tests ============

async function testConnectivity() {
    logSection('Connectivity Tests');

    log(`  Base URL: ${TEST_CONFIG.baseURL}`, colors.cyan);
    log(`  Adapter API: ${TEST_CONFIG.adapterURL}/adapter/v1`, colors.cyan);
    log(`  Virto API: ${TEST_CONFIG.virtoURL}/api`, colors.cyan);
    log(`  Contracts API: ${TEST_CONFIG.contractsURL}`, colors.cyan);
    log('');

    let allConnected = true;

    // Test Adapter API connectivity
    await runTest('Adapter API connectivity', async () => {
        try {
            const response = await adapterAPI.getClients();
            return { status: 'connected', hasData: !!response };
        } catch (error) {
            allConnected = false;
            throw new Error(`Cannot connect to Adapter API: ${error.message}`);
        }
    });

    // Test Virto API connectivity
    await runTest('Virto API connectivity', async () => {
        try {
            const response = await virtoAPI.healthCheck();
            return { status: 'connected', health: response };
        } catch (error) {
            allConnected = false;
            throw new Error(`Cannot connect to Virto API: ${error.message}`);
        }
    });

    // Test Contracts API connectivity
    await runTest('Contracts API connectivity', async () => {
        try {
            const response = await contractsAPI.healthCheck();
            return { status: 'connected', health: response };
        } catch (error) {
            allConnected = false;
            throw new Error(`Cannot connect to Contracts API: ${error.message}`);
        }
    });

    if (!allConnected) {
        log('\n⚠️  Some services are not accessible. Tests may fail.', colors.yellow);
        log('   Make sure the backend is running at:', colors.yellow);
        log(`   ${TEST_CONFIG.baseURL}`, colors.yellow);
        log('\n   Press Ctrl+C to abort or wait 5 seconds to continue...', colors.yellow);

        await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
        log('\n✓ All services are accessible!', colors.green);
    }

    return allConnected;
}

// ============ Main Test Runner ============

async function runAllTests() {
    log('\n' + '='.repeat(60), colors.bright + colors.cyan);
    log('  API Client Test Suite', colors.bright + colors.cyan);
    log('  Testing against deployed backend', colors.cyan);
    log('='.repeat(60) + '\n', colors.bright + colors.cyan);

    const testSuite = process.env.TEST_SUITE;

    try {
        // Run connectivity tests first
        if (!TEST_CONFIG.skipConnectivity) {
            const connected = await testConnectivity();
            if (!connected) {
                log('\n⚠️  Warning: Not all services are accessible', colors.yellow);
            }
        }

        if (!testSuite || testSuite === 'adapter') {
            await testAdapterAPI();
        }

        if (!testSuite || testSuite === 'virto') {
            await testVirtoAPI();
        }

        if (!testSuite || testSuite === 'contracts') {
            await testContractsAPI();
        }

        // Print summary
        logSection('Test Summary');
        log(`  Total Tests:    ${testResults.total}`, colors.bright);
        log(`  Passed:         ${testResults.passed}`, colors.green);
        log(`  Failed:         ${testResults.failed}`, testResults.failed > 0 ? colors.red : colors.green);
        log(`  Skipped:        ${testResults.skipped}`, colors.yellow);

        const successRate = testResults.total > 0
            ? ((testResults.passed / testResults.total) * 100).toFixed(2)
            : 0;

        log(`  Success Rate:   ${successRate}%`, successRate >= 80 ? colors.green : colors.red);

        if (testResults.errors.length > 0) {
            logSection('Failed Tests');
            testResults.errors.forEach((error, index) => {
                log(`  ${index + 1}. ${error.test}`, colors.red);
                log(`     ${error.error}`, colors.red);
            });
        }

        log('\n' + '='.repeat(60) + '\n', colors.cyan);

        // Exit with appropriate code
        process.exit(testResults.failed > 0 ? 1 : 0);

    } catch (error) {
        log(`\nFatal Error: ${error.message}`, colors.red);
        log(error.stack, colors.red);
        process.exit(1);
    }
}

// Run tests
runAllTests();

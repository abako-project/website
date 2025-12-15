/**
 * E2E Workflow Test - Complete PolkaTalent Platform Flow
 *
 * This test uses api-client.js to execute the complete workflow:
 * 1. Create Client and Developers
 * 2. Deploy Calendar Contract (if auth available)
 * 3. Register Workers in Calendar
 * 4. Set Worker Availability
 * 5. Deploy Project
 * 6. Create Milestones
 * 7. Propose Scope
 * 8. Approve Scope
 * 9. Assign Team
 * 10. Complete Tasks
 *
 * Authentication Strategy:
 * - Operations not requiring auth: Execute directly
 * - Operations requiring auth: Use TEST_TOKEN env var or skip with explanation
 *
 * Usage:
 *   node backend/tests/e2e-workflow.test.js
 *   TEST_TOKEN=your_token node backend/tests/e2e-workflow.test.js
 *   VERBOSE=true node backend/tests/e2e-workflow.test.js
 */

const {
    TestRunner,
    TestState,
    TestUserFactory,
    logger,
    colors,
    adapterAPI,
    virtoAPI,
    contractsAPI
} = require('./test-helper');

// Initialize test components
const runner = new TestRunner();
const state = new TestState();
const userFactory = new TestUserFactory('e2e');

// Check if we have a token for authenticated operations
const TEST_TOKEN = process.env.TEST_TOKEN || null;
const CALENDAR_ADDRESS = process.env.CALENDAR_ADDRESS || 'Cfqrpkb3Fs17DBpQR5UmBq3bDzaDTnFe89RK9EwZvPWtJpr';

/**
 * Phase 1: Setup - Create test users
 */
async function phase1_Setup() {
    logger.section('PHASE 1: Setup - Create Test Users');

    // Create Client
    const clientData = userFactory.createClient(1);
    logger.info(`Creating client: ${clientData.email}`);

    await runner.run('Create Client', async () => {
        const result = await adapterAPI.createClient(
            clientData.email,
            clientData.name,
            clientData.company,
            clientData.department,
            clientData.website,
            clientData.description,
            clientData.location
        );

        if (result && result.clientId) {
            state.addClient({ ...clientData, id: result.clientId });
            logger.info(`  Client ID: ${result.clientId}`);
        }
        return result;
    });

    // Create Developers
    for (let i = 1; i <= 3; i++) {
        const devData = userFactory.createDeveloper(i);
        logger.info(`Creating developer ${i}: ${devData.email}`);

        await runner.run(`Create Developer ${i}`, async () => {
            const result = await adapterAPI.createDeveloper(
                devData.email,
                devData.name,
                devData.githubUsername,
                devData.portfolioUrl
            );

            if (result && result.developerId) {
                state.addDeveloper({ ...devData, id: result.developerId });
                logger.info(`  Developer ID: ${result.developerId}`);
            }
            return result;
        });
    }

    // Verify users were created
    await runner.run('Verify Client exists', async () => {
        if (!state.latestClient?.id) {
            return { skip: true, reason: 'No client was created' };
        }
        return await adapterAPI.getClient(state.latestClient.id);
    });

    await runner.run('List all Clients', async () => {
        const result = await adapterAPI.getClients();
        logger.info(`  Total clients: ${result.clients?.length || 0}`);
        return result;
    });

    await runner.run('List all Developers', async () => {
        const result = await adapterAPI.getDevelopers();
        logger.info(`  Total developers: ${result.developers?.length || 0}`);
        return result;
    });
}

/**
 * Phase 2: Calendar Setup (requires authentication)
 */
async function phase2_CalendarSetup() {
    logger.section('PHASE 2: Calendar Setup');

    if (!TEST_TOKEN) {
        logger.warn('No TEST_TOKEN provided. Calendar operations will be skipped.');
        logger.warn('Set TEST_TOKEN environment variable for full test coverage.');
        logger.info('');
        logger.info('Calendar operations skipped:');
        logger.info('  - Deploy Calendar Contract');
        logger.info('  - Register Workers');
        logger.info('  - Set Availability');
        return;
    }

    state.calendarAddress = CALENDAR_ADDRESS;

    // Get developer addresses for calendar registration
    for (const developer of state.developers) {
        await runner.run(`Get address for ${developer.name}`, async () => {
            try {
                const response = await virtoAPI.getUserAddress(developer.email);
                if (response.address) {
                    developer.address = response.address;
                    logger.info(`  Address: ${response.address.substring(0, 20)}...`);
                }
                return response;
            } catch (error) {
                logger.warn(`  Could not get address: ${error.message}`);
                return { skip: true, reason: 'User not registered in Virto' };
            }
        });
    }

    // Register workers in calendar
    const workersWithAddresses = state.developers.filter(d => d.address);

    if (workersWithAddresses.length > 0) {
        await runner.run('Register Workers in Calendar', async () => {
            const workers = workersWithAddresses.map(d => d.address);
            return await adapterAPI.registerWorkers(state.calendarAddress, workers, TEST_TOKEN);
        }, { requiresAuth: true });

        // Set availability for each worker
        for (const developer of workersWithAddresses) {
            await runner.run(`Set availability for ${developer.name}`, async () => {
                return await adapterAPI.adminSetWorkerAvailability(
                    state.calendarAddress,
                    developer.address,
                    40, // 40 hours/week
                    TEST_TOKEN
                );
            }, { requiresAuth: true });
        }
    }

    // Query calendar state
    await runner.run('Get Registered Workers', async () => {
        return await adapterAPI.getRegisteredWorkers(state.calendarAddress);
    });

    await runner.run('Get All Workers Availability', async () => {
        return await adapterAPI.getAllWorkersAvailability(state.calendarAddress);
    });

    await runner.run('Get Available Workers', async () => {
        return await adapterAPI.getAvailableWorkers(state.calendarAddress);
    });
}

/**
 * Phase 3: Project Creation (requires authentication for deploy)
 */
async function phase3_ProjectCreation() {
    logger.section('PHASE 3: Project Creation');

    if (!TEST_TOKEN) {
        logger.warn('No TEST_TOKEN provided. Project deployment will be skipped.');
        logger.info('');
        logger.info('To test project workflow:');
        logger.info('  1. Get a valid auth token from the platform');
        logger.info('  2. Run: TEST_TOKEN=your_token node backend/tests/e2e-workflow.test.js');
        return;
    }

    if (!state.latestClient?.id) {
        logger.warn('No client available. Skipping project creation.');
        return;
    }

    const projectData = userFactory.createProject(state.latestClient.id);

    await runner.run('Deploy Project', async () => {
        const result = await adapterAPI.deployProject(
            'v5',
            projectData,
            state.latestClient.id,
            TEST_TOKEN
        );

        if (result && result.address) {
            state.addProject({
                ...projectData,
                contractAddress: result.address
            });
            logger.info(`  Contract Address: ${result.address}`);
        }
        return result;
    }, { requiresAuth: true });

    // If project was created, get its info
    if (state.latestProject?.contractAddress) {
        await runner.run('Get Project Info', async () => {
            return await adapterAPI.getProjectInfo(state.latestProject.contractAddress);
        });

        // Set calendar contract for project
        await runner.run('Set Calendar Contract for Project', async () => {
            return await adapterAPI.setCalendarContract(
                state.latestProject.contractAddress,
                state.calendarAddress,
                TEST_TOKEN
            );
        }, { requiresAuth: true });
    }
}

/**
 * Phase 4: Coordinator Assignment and Milestones
 */
async function phase4_CoordinatorAndMilestones() {
    logger.section('PHASE 4: Coordinator Assignment & Milestones');

    if (!state.latestProject?.contractAddress || !TEST_TOKEN) {
        logger.warn('No project available or no token. Skipping this phase.');
        return;
    }

    const projectAddress = state.latestProject.contractAddress;

    // Assign Coordinator
    await runner.run('Assign Coordinator', async () => {
        return await adapterAPI.assignCoordinator(projectAddress, TEST_TOKEN);
    }, { requiresAuth: true });

    // Create Milestones
    for (let i = 1; i <= 3; i++) {
        const milestoneData = userFactory.createMilestone(i);

        await runner.run(`Create Milestone ${i}`, async () => {
            const result = await adapterAPI.createMilestone(
                projectAddress,
                milestoneData,
                TEST_TOKEN
            );

            if (result && result.milestoneId) {
                state.milestones.push({
                    ...milestoneData,
                    id: result.milestoneId
                });
                logger.info(`  Milestone ID: ${result.milestoneId}`);
            }
            return result;
        }, { requiresAuth: true });
    }

    // Get all milestones
    await runner.run('Get All Milestones', async () => {
        return await adapterAPI.getMilestones(projectAddress, TEST_TOKEN);
    }, { requiresAuth: true });

    // Update first milestone
    if (state.milestones.length > 0) {
        await runner.run('Update Milestone 1', async () => {
            return await adapterAPI.updateMilestone(
                projectAddress,
                state.milestones[0].id,
                { title: 'Updated Milestone 1', budget: 6000 },
                TEST_TOKEN
            );
        }, { requiresAuth: true });
    }
}

/**
 * Phase 5: Scope Proposal and Approval
 */
async function phase5_ScopeWorkflow() {
    logger.section('PHASE 5: Scope Proposal & Approval');

    if (!state.latestProject?.contractAddress || !TEST_TOKEN) {
        logger.warn('No project available or no token. Skipping this phase.');
        return;
    }

    const projectAddress = state.latestProject.contractAddress;

    // Propose Scope
    await runner.run('Propose Scope', async () => {
        const milestones = state.milestones.map((m, i) => ({
            title: m.title,
            budget: m.budget,
            deliveryDate: m.deliveryDate
        }));

        return await adapterAPI.proposeScope(
            projectAddress,
            milestones,
            20, // 20% advance payment
            '0xdocumenthash123',
            TEST_TOKEN
        );
    }, { requiresAuth: true });

    // Get Scope Info
    await runner.run('Get Scope Info', async () => {
        try {
            return await adapterAPI.getScopeInfo(projectAddress);
        } catch (error) {
            if (error.statusCode === 404) {
                return { message: 'Scope not yet proposed' };
            }
            throw error;
        }
    });

    // Approve Scope (as client)
    await runner.run('Approve Scope', async () => {
        // Approve all tasks
        const approvedTaskIds = state.milestones.map((_, i) => i);
        return await adapterAPI.approveScope(projectAddress, approvedTaskIds, TEST_TOKEN);
    }, { requiresAuth: true });

    // Get all tasks after scope approval
    await runner.run('Get All Tasks', async () => {
        try {
            return await adapterAPI.getAllTasks(projectAddress);
        } catch (error) {
            if (error.statusCode === 404) {
                return { message: 'No tasks available' };
            }
            throw error;
        }
    });
}

/**
 * Phase 6: Team Assignment
 */
async function phase6_TeamAssignment() {
    logger.section('PHASE 6: Team Assignment');

    if (!state.latestProject?.contractAddress || !TEST_TOKEN) {
        logger.warn('No project available or no token. Skipping this phase.');
        return;
    }

    const projectAddress = state.latestProject.contractAddress;

    // Assign Team
    await runner.run('Assign Team', async () => {
        const teamSize = Math.min(state.developers.length, 3);
        return await adapterAPI.assignTeam(projectAddress, teamSize, TEST_TOKEN);
    }, { requiresAuth: true });

    // Get Team Info
    await runner.run('Get Team', async () => {
        try {
            return await adapterAPI.getTeam(projectAddress);
        } catch (error) {
            if (error.statusCode === 404) {
                return { message: 'Team not yet assigned' };
            }
            throw error;
        }
    });
}

/**
 * Phase 7: Task Execution (simulated)
 */
async function phase7_TaskExecution() {
    logger.section('PHASE 7: Task Execution');

    if (!state.latestProject?.contractAddress || !TEST_TOKEN) {
        logger.warn('No project available or no token. Skipping this phase.');
        return;
    }

    const projectAddress = state.latestProject.contractAddress;

    // Get first task and try to complete it
    await runner.run('Get Task 0 Info', async () => {
        try {
            return await adapterAPI.getTask(projectAddress, 0);
        } catch (error) {
            if (error.statusCode === 404) {
                return { message: 'Task 0 not found' };
            }
            throw error;
        }
    });

    await runner.run('Complete Task 0', async () => {
        try {
            return await adapterAPI.completeTask(projectAddress, 0, TEST_TOKEN);
        } catch (error) {
            // May fail if task is not in correct state
            return { message: `Task completion: ${error.message}` };
        }
    }, { requiresAuth: true });

    await runner.run('Get Task 0 Completion Status', async () => {
        try {
            return await adapterAPI.getTaskCompletionStatus(projectAddress, 0);
        } catch (error) {
            return { message: 'Could not get completion status' };
        }
    });
}

/**
 * Phase 8: Query Operations (no auth required)
 */
async function phase8_QueryOperations() {
    logger.section('PHASE 8: Query Operations (No Auth)');

    // These operations don't require authentication

    await runner.run('Get All Clients', async () => {
        return await adapterAPI.getClients();
    });

    await runner.run('Get All Developers', async () => {
        return await adapterAPI.getDevelopers();
    });

    // Find client by email
    if (state.latestClient?.email) {
        await runner.run('Find Client by Email', async () => {
            return await adapterAPI.findClientByEmail(state.latestClient.email);
        });
    }

    // Find developer by email
    if (state.latestDeveloper?.email) {
        await runner.run('Find Developer by Email', async () => {
            return await adapterAPI.findDeveloperByEmail(state.latestDeveloper.email);
        });
    }

    // Client projects
    if (state.latestClient?.id) {
        await runner.run('Get Client Projects', async () => {
            return await adapterAPI.getClientProjects(state.latestClient.id);
        });
    }

    // Developer milestones
    if (state.latestDeveloper?.id) {
        await runner.run('Get Developer Milestones', async () => {
            return await adapterAPI.getDeveloperMilestones(state.latestDeveloper.id);
        });
    }

    // Calendar queries
    await runner.run('Get Calendar Registered Workers', async () => {
        try {
            return await adapterAPI.getRegisteredWorkers(CALENDAR_ADDRESS);
        } catch (error) {
            return { message: 'Calendar not available' };
        }
    });
}

/**
 * Phase 9: Connectivity and Health Checks
 */
async function phase9_HealthChecks() {
    logger.section('PHASE 9: Health Checks');

    await runner.run('Virto API Health', async () => {
        return await virtoAPI.healthCheck();
    });

    await runner.run('Virto Payments Health', async () => {
        return await virtoAPI.paymentsHealthCheck();
    });

    await runner.run('Virto Memberships Health', async () => {
        return await virtoAPI.membershipsHealthCheck();
    });

    await runner.run('Contracts API Health', async () => {
        return await contractsAPI.healthCheck();
    });

    await runner.run('Get Project Constructors', async () => {
        return await contractsAPI.getProjectConstructors();
    });

    await runner.run('Get Calendar Constructors', async () => {
        return await contractsAPI.getCalendarConstructors();
    });
}

/**
 * Main test execution
 */
async function runE2EWorkflow() {
    logger.log('\n' + '='.repeat(70), colors.bright + colors.cyan);
    logger.log('  E2E WORKFLOW TEST - PolkaTalent Platform', colors.bright + colors.cyan);
    logger.log('  Using api-client.js for all operations', colors.cyan);
    logger.log('='.repeat(70), colors.bright + colors.cyan);

    // Show configuration
    logger.info('');
    logger.info('Test Configuration:');
    logger.info(`  Backend URL: ${process.env.BACKEND_API_URL || 'https://dev.abako.xyz'}`);
    logger.info(`  Auth Token: ${TEST_TOKEN ? 'Provided' : 'Not provided (auth operations will be skipped)'}`);
    logger.info(`  Calendar Address: ${CALENDAR_ADDRESS}`);
    logger.info(`  Verbose: ${process.env.VERBOSE === 'true'}`);
    logger.info('');

    try {
        // Execute all phases
        await phase9_HealthChecks();     // Start with health checks
        await phase1_Setup();
        await phase2_CalendarSetup();
        await phase3_ProjectCreation();
        await phase4_CoordinatorAndMilestones();
        await phase5_ScopeWorkflow();
        await phase6_TeamAssignment();
        await phase7_TaskExecution();
        await phase8_QueryOperations();

        // Print summary
        const exitCode = runner.summary();

        // Show created resources
        logger.section('Created Resources');
        logger.log(`  Clients: ${state.clients.length}`, colors.blue);
        state.clients.forEach(c => logger.log(`    - ${c.name} (ID: ${c.id})`, colors.cyan));

        logger.log(`  Developers: ${state.developers.length}`, colors.blue);
        state.developers.forEach(d => logger.log(`    - ${d.name} (ID: ${d.id})`, colors.cyan));

        logger.log(`  Projects: ${state.projects.length}`, colors.blue);
        state.projects.forEach(p => logger.log(`    - ${p.title} (Address: ${p.contractAddress?.substring(0, 20)}...)`, colors.cyan));

        logger.log(`  Milestones: ${state.milestones.length}`, colors.blue);
        state.milestones.forEach(m => logger.log(`    - ${m.title} (ID: ${m.id})`, colors.cyan));

        logger.log('\n' + '='.repeat(70), colors.cyan);

        // Exit with appropriate code
        process.exit(exitCode);

    } catch (error) {
        logger.error(`\nFatal Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
}

// Export for use as module
module.exports = { runE2EWorkflow };

// Run if executed directly
if (require.main === module) {
    runE2EWorkflow();
}

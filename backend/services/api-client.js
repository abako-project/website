/**
 * HTTP Client for Backend API Communication
 * Wrapper sobre axios para manejar requests al backend desplegado en dev.abako.xyz
 */

const axios = require('axios');
const apiConfig = require('../config/api.config');

/**
 * Create axios instance with default configuration
 */
const createClient = (baseURL) => {
    return axios.create({
        baseURL: baseURL || apiConfig.baseURL,
        timeout: apiConfig.timeout,
        headers: apiConfig.headers
    });
};

// Clients for each API
const adapterClient = createClient(apiConfig.adapterAPI.baseURL);
const virtoClient = createClient(apiConfig.virtoAPI.baseURL);
const contractsClient = createClient(apiConfig.contractsAPI.baseURL);

/**
 * Generic error handler
 */
const handleError = (error, context = '') => {
    console.error(`[API Client Error] ${context}:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
    });

    // Re-throw with more context
    const enhancedError = new Error(
        error.response?.data?.message ||
        error.message ||
        'Unknown API error'
    );
    enhancedError.statusCode = error.response?.status || 500;
    enhancedError.originalError = error;
    enhancedError.context = context;

    throw enhancedError;
};

/**
 * Adapter API Client Methods
 */
const adapterAPI = {

    // ================== Auth =========================

    async checkRegistered(userId) {
        try {
            const response = await adapterClient.get(`/adapter/v1/auth/check-registered/${userId}`);
            return response.data;
        } catch (error) {
            handleError(error, `checkRegistered(${userId})`);
        }
    },

    async customRegister(data) {
        try {
            const response = await adapterClient.post(apiConfig.adapterAPI.endpoints.auth.customRegister, data);
            return response.data;
        } catch (error) {
            handleError(error, 'customRegister');
        }
    },

    async customConnect(data) {
        try {
            const response = await adapterClient.post(apiConfig.adapterAPI.endpoints.auth.customConnect, data);
            return response.data;
        } catch (error) {
            handleError(error, 'customConnect');
        }
    },

    async sign(extrinsicData, token) {
        try {
            const response = await adapterClient.post('/adapter/v1/auth/sign', extrinsicData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, 'sign');
        }
    },

    // ========= Clients ==============================

    async getClients() {
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.clients.list);
            return response.data;
        } catch (error) {
            handleError(error, 'getClients');
        }
    },

    async getClient(clientId) {
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.clients.get(clientId));
            return response.data;
        } catch (error) {
            handleError(error, `getClient(${clientId})`);
        }
    },

    async createClient(email, name, company, department, website, description, location, image) {
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("name", name);
            formData.append("company", company || "company");
            formData.append("department", department || "department");
            formData.append("website", website || "website");
            formData.append("description", description || "description");
            formData.append("location", location || "location");
            if (image) formData.append("image", image);

            const response = await adapterClient.post(apiConfig.adapterAPI.endpoints.clients.create, formData, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, 'createClient');
        }
    },

    async updateClient(clientId, data) {
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    formData.append(key, data[key]);
                }
            });

            const response = await adapterClient.put(apiConfig.adapterAPI.endpoints.clients.update(clientId), formData, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, `updateClient(${clientId})`);
        }
    },

  // version mas secilla de la de arriba.
    async updateClient(clientId, data) {
        try {
            const response = await adapterClient.put(apiConfig.adapterAPI.endpoints.clients.update(clientId), data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, 'updateClient');
        }
    },


    async getClientAttachment(clientId) {
        try {
            const response = await adapterClient.get(`/adapter/v1/clients/${clientId}/attachment`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            handleError(error, `getClientAttachment(${clientId})`);
        }
    },

    async getClientProjects(clientId) {
        try {
            const response = await adapterClient.get(`/adapter/v1/clients/${clientId}/projects`);
            return response.data;
        } catch (error) {
            handleError(error, `getClientProjects(${clientId})`);
        }
    },

    async findClientByEmail(email) {
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.clients.list);
            return response.data.clients.find(d => d.email === email);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            handleError(error, `findClientByEmail(${email})`);
        }
    },


    async clientAttachment(clientId) {
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.clients.attachment(+clientId));
            return response.data;
        } catch (error) {
            handleError(error, 'clientAttachment');
        }
    },


    // =============== Developers =============================

    async getDevelopers() {
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.developers.list);
            return response.data;
        } catch (error) {
            handleError(error, 'getDevelopers');
        }
    },

    async getDeveloper(developerId) {
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.developers.get(developerId));
            return response.data;
        } catch (error) {
            handleError(error, `getDeveloper(${developerId})`);
        }
    },

    async createDeveloper(email, name, githubUsername, portfolioUrl,  image) {
        try {
            const formData = new FormData();
            formData.append("email", email);
            formData.append("name", name);
            formData.append("githubUsername", githubUsername || "githubUsername");
            formData.append("portfolioUrl", portfolioUrl || "portfolioUrl");
            if (image) formData.append("image", image);

            const response = await adapterClient.post(apiConfig.adapterAPI.endpoints.developers.create, formData, {
                headers: {
                    'Accept': 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            handleError(error, 'createDeveloper');
        }
    },

    async updateDeveloper(developerId, data, image) {
        try {
            const formData = new FormData();
            Object.keys(data).forEach(key => {
                if (data[key] !== undefined && data[key] !== null) {
                    if (Array.isArray(data[key])) {
                        data[key].forEach(item => formData.append(key, item));
                    } else {
                        formData.append(key, data[key]);
                    }
                }
            });
            if (image) formData.append("image", image);

            const response = await adapterClient.put(apiConfig.adapterAPI.endpoints.developers.update(developerId), formData, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, `updateDeveloper(${developerId})`);
        }
    },

    async getDeveloperAttachment(developerId) {
        try {
            const response = await adapterClient.get(`/adapter/v1/developers/${developerId}/attachment`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            handleError(error, `getDeveloperAttachment(${developerId})`);
        }
    },

    async getDeveloperProjects(developerId) {
        try {
            const response = await adapterClient.get(`/adapter/v1/developers/${developerId}/projects`);
            return response.data;
        } catch (error) {
            handleError(error, `getDeveloperProjects(${developerId})`);
        }
    },

    async getDeveloperMilestones(developerId) {
        try {
            const response = await adapterClient.get(`/adapter/v1/developers/${developerId}/milestones`);
            return response.data;
        } catch (error) {
            handleError(error, `getDeveloperMilestones(${developerId})`);
        }
    },

    async findDeveloperByEmail(email) {
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.developers.list);
            return response.data.developers.find(d => d.email === email);
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            handleError(error, `findDeveloperByEmail(${email})`);
        }
    },


    // ================== Projects =========================


    // Proyectos de un cliente
    async getClientProjects(clientId) {
        const url = `/adapter/v1/clients/${clientId}/projects`;
        try {
            const {data: {projects}} = await adapterClient.get(url);
            dump("Proyectos de un cliente", projects);
            return projects;
        } catch (error) {
            handleError(error, url);
        }
    },


    // Proyectos de un developer
    async getDeveloperProjects(developerId) {
        const url = `/adapter/v1/developers/${developerId}/projects`;
        try {
            const {data: {projects}} = await adapterClient.get(url);
            dump("Proyectos de un developer", projects);
            return projects;
        } catch (error) {
            handleError(error, url);
            //   dump("Error - Proyectos de un cliente", error);
        }
    },

    // Crear una propuesta.
    // projectData es {title, summary, description, url, projectTypeId, budgetId, deliveryTimeId, deliveryDate}
    async deployProject(version, projectData, clientId, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/deploy/${version}`,
                { ...projectData, clientId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `deployProject(${version})`);
        }
    },

   async assignCoordinator(contractAddress, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/${contractAddress}/assign_coordinator`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `assignCoordinator(${contractAddress})`);
        }
    },

    async assignTeam(contractAddress, teamSize, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/${contractAddress}/assign_team`,
                { _team_size: teamSize },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `assignTeam(${contractAddress})`);
        }
    },

    async markCompleted(contractAddress, ratings, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/${contractAddress}/mark_completed`,
                { ratings },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `markCompleted(${contractAddress})`);
        }
    },

    async setCalendarContract(contractAddress, calendarContractAddress, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/${contractAddress}/set_calendar_contract`,
                { calendar_contract: calendarContractAddress },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `setCalendarContract(${contractAddress})`);
        }
    },

    async proposeScope(contractAddress, tasks, advancePaymentPercentage, documentHash, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/${contractAddress}/propose_scope`,
                {
                    tasks,
                    advance_payment_percentage: advancePaymentPercentage,
                    document_hash: documentHash
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `proposeScope(${contractAddress})`);
        }
    },

    async approveScope(contractAddress, approvedTaskIds, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/${contractAddress}/approve_scope`,
                { approved_task_ids: approvedTaskIds },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `approveScope(${contractAddress})`);
        }
    },

    async rejectScope(contractAddress, clientResponse, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/${contractAddress}/reject_scope`,
                { clientResponse },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `rejectScope(${contractAddress})`);
        }
    },

    async completeTask(contractAddress, taskId, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/${contractAddress}/complete_task`,
                { task_id: taskId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `completeTask(${contractAddress})`);
        }
    },

    async getProjectInfo(contractAddress) {
        try {
            const response = await adapterClient.get(`/adapter/v1/projects/${contractAddress}/get_project_info`);
            return response.data;
        } catch (error) {
            handleError(error, `getProjectInfo(${contractAddress})`);
        }
    },

    async getTeam(contractAddress) {
        try {
            const response = await adapterClient.get(`/adapter/v1/projects/${contractAddress}/get_team`);
            return response.data;
        } catch (error) {
            handleError(error, `getTeam(${contractAddress})`);
        }
    },

    async getScopeInfo(contractAddress) {
        try {
            const response = await adapterClient.get(`/adapter/v1/projects/${contractAddress}/get_scope_info`);
            return response.data;
        } catch (error) {
            handleError(error, `getScopeInfo(${contractAddress})`);
        }
    },

    async getTask(contractAddress, taskId) {
        try {
            const response = await adapterClient.get(`/adapter/v1/projects/${contractAddress}/get_task`, {
                params: { task_id: taskId }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getTask(${contractAddress}, ${taskId})`);
        }
    },

    async getTaskCompletionStatus(contractAddress, taskId) {
        try {
            const response = await adapterClient.get(`/adapter/v1/projects/${contractAddress}/get_task_completion_status`, {
                params: { task_id: taskId }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getTaskCompletionStatus(${contractAddress}, ${taskId})`);
        }
    },

    async getAllTasks(contractAddress) {
        try {
            const response = await adapterClient.get(`/adapter/v1/projects/${contractAddress}/get_all_tasks`);
            return response.data;
        } catch (error) {
            handleError(error, `getAllTasks(${contractAddress})`);
        }
    },


    async updateProject(contractAddress, data, token) {
        try {
            const response = await adapterClient.put(
                `/adapter/v1/projects/${contractAddress}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `updateProject(${contractAddress})`);
        }
    },

    async createMilestone(projectId, milestoneData, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/projects/${projectId}/milestones`,
                milestoneData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `createMilestone(${projectId})`);
        }
    },

    async getMilestones(projectId, token) {
        try {
            const response = await adapterClient.get(`/adapter/v1/projects/${projectId}/milestones`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getMilestones(${projectId})`);
        }
    },

    async getMilestone(projectId, milestoneId, token) {
        try {
            const response = await adapterClient.get(`/adapter/v1/projects/${projectId}/milestones/${milestoneId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getMilestone(${projectId}, ${milestoneId})`);
        }
    },

    async updateMilestone(projectId, milestoneId, data, token) {
        try {
            const response = await adapterClient.put(
                `/adapter/v1/projects/${projectId}/milestones/${milestoneId}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `updateMilestone(${projectId}, ${milestoneId})`);
        }
    },

    async deleteMilestone(projectId, milestoneId, token) {
        try {
            const response = await adapterClient.delete(`/adapter/v1/projects/${projectId}/milestones/${milestoneId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, `deleteMilestone(${projectId}, ${milestoneId})`);
        }
    },

    // ================== Calendar =========================

    async registerWorker(contractAddress, worker, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/calendar/${contractAddress}/register_worker`,
                { worker },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `registerWorker(${contractAddress})`);
        }
    },

    async setAvailability(contractAddress, availability, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/calendar/${contractAddress}/set_availability`,
                { availability },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `setAvailability(${contractAddress})`);
        }
    },

    async registerWorkers(contractAddress, workers, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/calendar/${contractAddress}/register_workers`,
                { workers },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `registerWorkers(${contractAddress})`);
        }
    },

    async adminSetWorkerAvailability(contractAddress, worker, availability, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/calendar/${contractAddress}/admin_set_worker_availability`,
                { worker, availability },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `adminSetWorkerAvailability(${contractAddress})`);
        }
    },

    async getAvailabilityHours(contractAddress, worker) {
        try {
            const response = await adapterClient.get(
                `/adapter/v1/calendar/${contractAddress}/get_availability_hours`,
                { params: { worker } }
            );
            return response.data;
        } catch (error) {
            handleError(error, `getAvailabilityHours(${contractAddress})`);
        }
    },

    async isAvailable(contractAddress, worker, minHours) {
        try {
            const params = { worker };
            if (minHours !== undefined) params.min_hours = minHours;

            const response = await adapterClient.get(
                `/adapter/v1/calendar/${contractAddress}/is_available`,
                { params }
            );
            return response.data;
        } catch (error) {
            handleError(error, `isAvailable(${contractAddress})`);
        }
    },

    async getAvailableWorkers(contractAddress, minHours) {
        try {
            const params = {};
            if (minHours !== undefined) params.min_hours = minHours;

            const response = await adapterClient.get(
                `/adapter/v1/calendar/${contractAddress}/get_available_workers`,
                { params }
            );
            return response.data;
        } catch (error) {
            handleError(error, `getAvailableWorkers(${contractAddress})`);
        }
    },

    async getRegisteredWorkers(contractAddress) {
        try {
            const response = await adapterClient.get(`/adapter/v1/calendar/${contractAddress}/get_registered_workers`);
            return response.data;
        } catch (error) {
            handleError(error, `getRegisteredWorkers(${contractAddress})`);
        }
    },

    async getAllWorkersAvailability(contractAddress) {
        try {
            const response = await adapterClient.get(`/adapter/v1/calendar/${contractAddress}/get_all_workers_availability`);
            return response.data;
        } catch (error) {
            handleError(error, `getAllWorkersAvailability(${contractAddress})`);
        }
    },

    async deployCalendar(version, token) {
        try {
            const response = await adapterClient.post(
                `/adapter/v1/calendar/deploy/${version}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `deployCalendar(${version})`);
        }
    }
};


/**
 * VOS Mock API Client Methods (WebAuthn)
 */
const virtoAPI = {

    // ========= WebAuthn / VOS Mock ======================

    async healthCheck() {
        try {
            const response = await virtoClient.get('/api/health');
            return response.data;
        } catch (error) {
            handleError(error, 'virtoAPI.healthCheck');
        }
    },

    async checkUserRegistered(userId) {
        try {
            const response = await virtoClient.get(apiConfig.virtoAPI.endpoints.checkUserRegistered, {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            handleError(error, `checkUserRegistered(${userId})`);
        }
    },

    async getAttestationOptions(userId, name, challenge) {
        try {
            // Si no se proporciona challenge, generar uno aleatorio
            const finalChallenge = challenge || '0x' + Array.from({ length: 32 }, () =>
                Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
            ).join('');

            const response = await virtoClient.get(apiConfig.virtoAPI.endpoints.attestation, {
                params: {
                    id: userId,
                    name: name || userId,
                    challenge: finalChallenge
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getAttestationOptions(${userId})`);
        }
    },

    async customRegister(preparedData) {
        try {
            const response = await virtoClient.post(apiConfig.virtoAPI.endpoints.register, preparedData);
            return response.data;
        } catch (error) {
            handleError(error, 'virtoAPI.customRegister');
        }
    },

    async getAssertionOptions(userId, challenge) {
        try {
            const params = { userId };
            if (challenge) params.challenge = challenge;

            const response = await virtoClient.get(apiConfig.virtoAPI.endpoints.assertion, params);
            return response.data;
        } catch (error) {
            handleError(error, `getAssertionOptions(${userId})`);
        }
    },

    async customConnect(preparedData) {
        try {
            const response = await virtoClient.post(apiConfig.virtoAPI.endpoints.assertion, preparedData);
            return response.data;
        } catch (error) {
            handleError(error, 'virtoAPI.customConnect');
        }
    },

    async getUserAddress(userId) {
        try {
            const response = await virtoClient.get(apiConfig.virtoAPI.endpoints.getUserAddress, {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getUserAddress(${userId})`);
        }
    },

    async addMember(userId) {
        try {
            const response = await virtoClient.post('/api/add-member', { userId });
            return response.data;
        } catch (error) {
            handleError(error, `addMember(${userId})`);
        }
    },

    async isMember(address) {
        try {
            const response = await virtoClient.get('/api/is-member', {
                params: { address }
            });
            return response.data;
        } catch (error) {
            handleError(error, `isMember(${address})`);
        }
    },

    async fund(address) {
        try {
            const response = await virtoClient.post(apiConfig.virtoAPI.endpoints.fund, { address });
            return response.data;
        } catch (error) {
            handleError(error, `fund(${address})`);
        }
    },

    // ========= Payments =================================

    async createPayment(paymentData) {
        try {
            const response = await virtoClient.post('/api/payments/create', paymentData);
            return response.data;
        } catch (error) {
            handleError(error, 'createPayment');
        }
    },

    async releasePayment(paymentData) {
        try {
            const response = await virtoClient.post('/api/payments/release', paymentData);
            return response.data;
        } catch (error) {
            handleError(error, 'releasePayment');
        }
    },

    async acceptAndPay(paymentData) {
        try {
            const response = await virtoClient.post('/api/payments/accept-and-pay', paymentData);
            return response.data;
        } catch (error) {
            handleError(error, 'acceptAndPay');
        }
    },

    async getPayment(paymentId) {
        try {
            const response = await virtoClient.get('/api/payments/get', {
                params: { paymentId }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getPayment(${paymentId})`);
        }
    },

    async paymentsHealthCheck() {
        try {
            const response = await virtoClient.get('/api/payments/health');
            return response.data;
        } catch (error) {
            handleError(error, 'paymentsHealthCheck');
        }
    },

    // ========= Memberships/Management ===================

    async getCommunityAddress(communityId) {
        try {
            const response = await virtoClient.get(`/api/memberships/${communityId}/address`);
            return response.data;
        } catch (error) {
            handleError(error, `getCommunityAddress(${communityId})`);
        }
    },

    async getMembers(communityId, page, limit) {
        try {
            const params = {};
            if (page !== undefined) params.page = page;
            if (limit !== undefined) params.limit = limit;

            const response = await virtoClient.get(`/api/memberships/${communityId}/members`, { params });
            return response.data;
        } catch (error) {
            handleError(error, `getMembers(${communityId})`);
        }
    },

    async getMember(communityId, membershipId) {
        try {
            const response = await virtoClient.get(`/api/memberships/${communityId}/members/${membershipId}`);
            return response.data;
        } catch (error) {
            handleError(error, `getMember(${communityId}, ${membershipId})`);
        }
    },

    async checkMembership(communityId, address) {
        try {
            const response = await virtoClient.get(`/api/memberships/${communityId}/members/${address}/check`);
            return response.data;
        } catch (error) {
            handleError(error, `checkMembership(${communityId}, ${address})`);
        }
    },

    async addCommunityMember(communityId, memberAddress) {
        try {
            const response = await virtoClient.post(`/api/memberships/${communityId}/members`, { memberAddress });
            return response.data;
        } catch (error) {
            handleError(error, `addCommunityMember(${communityId})`);
        }
    },

    async removeMember(communityId, address) {
        try {
            const response = await virtoClient.delete(`/api/memberships/${communityId}/members/${address}`);
            return response.data;
        } catch (error) {
            handleError(error, `removeMember(${communityId}, ${address})`);
        }
    },

    async membershipsHealthCheck() {
        try {
            const response = await virtoClient.get('/api/memberships/health');
            return response.data;
        } catch (error) {
            handleError(error, 'membershipsHealthCheck');
        }
    }
};

/**
 * Contracts API Client Methods
 */
const contractsAPI = {

    // ========= Health Check =============================

    async healthCheck() {
        try {
            const response = await contractsClient.get(apiConfig.contractsAPI.endpoints.health);
            return response.data;
        } catch (error) {
            handleError(error, 'contractsAPI.healthCheck');
        }
    },

    // ========= Projects =================================

    async getProjectConstructors() {
        try {
            const response = await contractsClient.get(apiConfig.contractsAPI.endpoints.projects.constructors);
            return response.data;
        } catch (error) {
            handleError(error, 'getProjectConstructors');
        }
    },

    async queryProjectMethod(contractAddress, methodName, params = {}) {
        try {
            const response = await contractsClient.get(
                apiConfig.contractsAPI.endpoints.projects.query(contractAddress, methodName),
                { params }
            );
            return response.data;
        } catch (error) {
            handleError(error, `queryProjectMethod(${contractAddress}, ${methodName})`);
        }
    },

    async callProjectMethod(contractAddress, methodName, data = {}) {
        try {
            const response = await contractsClient.post(
                apiConfig.contractsAPI.endpoints.projects.call(contractAddress, methodName),
                { data }
            );
            return response.data;
        } catch (error) {
            handleError(error, `callProjectMethod(${contractAddress}, ${methodName})`);
        }
    },

    async deployProjectV5(name, daoAddress) {
        try {
            const response = await contractsClient.post(
                apiConfig.contractsAPI.endpoints.projects.deploy.v5,
                { name, dao_address: daoAddress }
            );
            return response.data;
        } catch (error) {
            handleError(error, 'deployProjectV5');
        }
    },

    async deployProjectV6(name, daoAddress) {
        try {
            const response = await contractsClient.post(
                apiConfig.contractsAPI.endpoints.projects.deploy.v6,
                { name, dao_address: daoAddress }
            );
            return response.data;
        } catch (error) {
            handleError(error, 'deployProjectV6');
        }
    },

    // ========= Calendar =================================

    async getCalendarConstructors() {
        try {
            const response = await contractsClient.get(apiConfig.contractsAPI.endpoints.calendar.constructors);
            return response.data;
        } catch (error) {
            handleError(error, 'getCalendarConstructors');
        }
    },

    async queryCalendarMethod(contractAddress, methodName, params = {}) {
        try {
            const response = await contractsClient.get(
                apiConfig.contractsAPI.endpoints.calendar.query(contractAddress, methodName),
                { params }
            );
            return response.data;
        } catch (error) {
            handleError(error, `queryCalendarMethod(${contractAddress}, ${methodName})`);
        }
    },

    async callCalendarMethod(contractAddress, methodName, data = {}) {
        try {
            const response = await contractsClient.post(
                apiConfig.contractsAPI.endpoints.calendar.call(contractAddress, methodName),
                data
            );
            return response.data;
        } catch (error) {
            handleError(error, `callCalendarMethod(${contractAddress}, ${methodName})`);
        }
    },

    async deployCalendarV5(params = {}) {
        try {
            const response = await contractsClient.post(
                apiConfig.contractsAPI.endpoints.calendar.deploy,
                params
            );
            return response.data;
        } catch (error) {
            handleError(error, 'deployCalendarV5');
        }
    }
};


const dump = (title, v) => {
    console.log("===========", title, "===============");
    //console.log(v);
    console.log(JSON.stringify(v, undefined, 2));
    console.log("=======================================");
}

module.exports = {
    adapterAPI,
    virtoAPI,
    contractsAPI,
    // Export clients for custom requests if needed
    clients: {
        adapter: adapterClient,
        virto: virtoClient,
        contracts: contractsClient
    }
};

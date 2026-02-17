
const fs = require("fs");

function save() {
    fs.writeFile(__dirname + "/all.json",
        JSON.stringify({clients, developers, projects, milestones}, undefined, 2),
        function (err) {
            console.log(err);
        });
}

function dumpAll() {
    dump(">>>>>>>> Apapter MOCK Data <<<<<<<<<",
        {clients, developers, projects, milestones});
}


const dump = (title, v) => {
    console.log("===========", title, "===============");
    //console.log(v);
    console.log(JSON.stringify(v, undefined, 2));
    console.log("=======================================");
}

let {clients, developers, projects, milestones} = JSON.parse(fs.readFileSync(__dirname + "/all.json",{flag: "a+"}).toString());

if (!clients) {
     clients = require('./clients.json');
     developers = require('./developers.json');

     projects = require('./projects.json');
     milestones = require('./milestones.json');

     save();
     dumpAll()
}

dumpAll()

exports.adapterAPI = {

    // ================== Auth =========================

    async checkRegistered(userId) {
        throw new Error("MOCK: Method not implemented.")
    },
    async customRegister(data) {
        throw new Error("MOCK: Method not implemented.")
    },
    async customConnect(data) {
        throw new Error("MOCK: Method not implemented.")
    },
    async sign(extrinsicData, token) {
        throw new Error("MOCK: Method not implemented.")
    },

// =============== Clients =========================

    async getClients() { // ok
        return {clients};
    },

    async getClient(clientId) {
        return {client: clients.find(client => client.id == clientId)};
    },

    async createClient(email, name, company = "", department = "", website= "", description= "", location = "", languages = [], image) {
        let client = {
            id: clients.length + 1,
            email, name, company, department, website, description, location, languages, image
        };
        clients.push(client);
        save();
        return {...client};
    },

    async updateClient(clientId, data, image) {
        let index = clients.findIndex(client => client.id == clientId);
        if (index > -1) {
            clients[index] = {...clients[index], ...data};
            if (image) {
                console.log("----updateClient---------image---------");
                console.log(image);
                console.log("----------------------");
                clients[index].image = image;
            }
            save();
            return clients[index];
        }
    },

    async getClientAttachment(clientId) { // ok
        let index = clients.findIndex(client => client.id == clientId);
        if (index > -1) {
            const {image} = clients[index];
            if (image) {
                return {
                    mime: "image/png",
                    image
                };
            }
        }
        return null;
    },

    async getClientProjects(clientId) {
        return projects.filter(project => project.clientId == clientId).map(project => ({...project}));
    },

    async findClientByEmail(email) {
        return clients.find(d => d.email === email);
    },

    // =============== Developers =========================

    async getDevelopers() { // ok
        return {developers};
    },

    async getDeveloper(developerId) {
        return {developer: developers.find(developer => developer.id == developerId)};
    },

    async createDeveloper(email, name, githubUsername = "", portfolioUrl = "", image) {
        let developer = {
            id: developers.length + 1,
            email, name, githubUsername, portfolioUrl, image
        };
        developers.push(developer);
        save();
        return {developerId: developer.id};
    },

    async updateDeveloper(developerId, data, image) {
        let index = developers.findIndex(developer => developer.id == developerId);
        if (index > -1) {
            developers[index] = {...developers[index], ...data};
            if (image) {
                developers[index].image = image;
            }
            save();
            return clients[index];
        }
    },

    async getDeveloperAttachment(developerId) { // ok
        let index = developers.findIndex(developer => developer.id == developerId);
        if (index > -1) {
            const {image} = developers[index];
            if (image) {
                return {
                    mime: "image/png",
                    image
                };
            }
        }
        return null;
    },

    async getDeveloperProjects(developerId) {
        return projects.filter(project => project.consultantId == developerId).map(project => ({...project}));
    },

    async getDeveloperMilestones(developerId) {
        return {milestones: []};
    },

    async findDeveloperByEmail(email) {
        return developers.find(d => d.email === email);
    },

    // ================== Projects =========================

    // Crear una propuesta.
    // projectData es {title, summary, description, url, projectTypeId, budgetId, deliveryTimeId, deliveryDate}
    async deployProject(version, projectData, clientId, token) {

        let projectId = Date.now() + "";

        let project = {
            _id: projectId,
            ...projectData,
            state: "draft",
            creationStatus: "creating",
            clientId,
            "calendarContract": Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12),
            "createdAt": (new Date()).toISOString(),
            "updatedAt": (new Date()).toISOString(),
            "__v": 0
        }

        projects.push(project);

        save();


        setTimeout(() => {

                let index = projects.findIndex(project => project._id == projectId);

                if (index > -1) {

                    projects[index].state = "deployed";
                    projects[index].creationStatus = "created";

                    projects[index].consultantId = "1";

                    save();

                }
            },
            5000);
        return {projectId};
    },

    async assignCoordinator(contractAddress, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.assignCoordinator(contractAddress),
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
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.assignTeam(contractAddress),
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
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.markCompleted(contractAddress),
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
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.setCalendarContract(contractAddress),
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

    async proposeScope(projectId, milestones, advancePaymentPercentage, documentHash, token) {

        milestones[projectId] = milestones.map((m,i) => ({...m, state: "pending", _id: i+1}));

        let index = projects.findIndex(project => project._id == projectId);
        if (index > -1) {

            projects[index].state = "scope_proposed";
            save();
        }

    },

    async approveScope(projectId, approvedTaskIds, token) {

        let index = projects.findIndex(project => project._id == projectId);
        if (index > -1) {
            projects[index].state = "scope_accepted";
            save();
        }
    },

    async rejectScope(projectId, clientResponse, token) {

        let index = projects.findIndex(project => project._id == projectId);
        if (index > -1) {
            projects[index].state = "scope_rejected";
            save();
        }
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.rejectScope(projectId),
                { clientResponse },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `rejectScope(${projectId})`);
        }
    },

    async submitTaskForReview(projectId, taskId, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.submitTaskForReview(projectId),
                { task_id: taskId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `submitTaskForReview(${projectId},${taskId})`);
        }
    },

    async completeTask(projectId, taskId, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.completeTask(projectId),
                { task_id: taskId },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `completeTask(${projectId},${taskId})`);
        }
    },

    async rejectTask(projectId, taskId, reason, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.rejectTask(projectId, taskId),
                { rejectionReason: reason },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `rejectTask(${projectId},${taskId},"${reason}")`);
        }
    },

    async getProject(contractAddress) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.get(`/projects/${contractAddress}`);
            return response.data;
        } catch (error) {
            handleError(error, `getProject(${contractAddress})`);
        }
    },

    async getProjectInfo(projectId) {

        let project = projects.find(p => p._id == projectId);

        return {...project};
    },

    async getTeam(contractAddress) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.projects.getTeam(contractAddress));
            return response.data;
        } catch (error) {
            handleError(error, `getTeam(${contractAddress})`);
        }
    },

    async getScopeInfo(projectId) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.projects.getScopeInfo(projectId));
            return response.data;
        } catch (error) {
            handleError(error, `getScopeInfo(${projectId})`);
        }
    },

    async getTask(contractAddress, taskId) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.projects.getTask(contractAddress), {
                params: { task_id: taskId }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getTask(${contractAddress}, ${taskId})`);
        }
    },

    async getTaskCompletionStatus(contractAddress, taskId) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.projects.getTaskCompletion(contractAddress), {
                params: { task_id: taskId }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getTaskCompletionStatus(${contractAddress}, ${taskId})`);
        }
    },

    async getAllTasks(projectId) {

        let pmilestones = (milestones[projectId] ?? []).map(m => ({...m}));
        return {milestones: pmilestones};
    },


    async updateProject(contractAddress, data, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.put(
                apiConfig.adapterAPI.endpoints.projects.update(contractAddress),
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

    async coordinatorRejectProject(contractAddress, rejectionReason, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.coordinatorReject(contractAddress),
                { rejectionReason },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `coordinatorRejectProject(${contractAddress})`);
        }
    },

    async getMilestones(contractAddress, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.projects.milestones.list(contractAddress), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getMilestones(${contractAddress})`);
        }
    },

    /* No existe
    async getMilestone(contractAddress, milestoneId, token) {
        try {
            const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.projects.milestones.get(contractAddress, milestoneId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, `getMilestone(${contractAddress}, ${milestoneId})`);
        }
    },
*/

    async createMilestone(contractAddress, milestoneData, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.post(
                apiConfig.adapterAPI.endpoints.projects.milestones.create(contractAddress),
                milestoneData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `createMilestone(${contractAddress})`);
        }
    },

    async updateMilestone(contractAddress, milestoneId, data, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.put(
                apiConfig.adapterAPI.endpoints.projects.milestones.update(contractAddress, milestoneId),
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            handleError(error, `updateMilestone(${contractAddress}, ${milestoneId})`);
        }
    },

    async deleteMilestone(contractAddress, milestoneId, token) {
        throw new Error("MOCK: Method not implemented.")
        try {
            const response = await adapterClient.delete(apiConfig.adapterAPI.endpoints.projects.milestones.remove(contractAddress, milestoneId), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, `deleteMilestone(${contractAddress}, ${milestoneId})`);
        }
    },

    // ================== Calendar =========================

    async registerWorker(worker, token) {
        return {success: true};
    },

    async setAvailability(availability, weeklyHours, token) {
        return;
    },

    async registerWorkers(workers, token) {
        return;
    },

    async adminSetWorkerAvailability(worker, availability, token) {
        return;
    },

    async getAvailabilityHours(worker) {
        return;
    },

    async isAvailable(worker, minHours) {
        return true;
    },

    async getAvailableWorkers(minHours) {
        return [];
    },

    async getRegisteredWorkers() {
        return {
            success: true,
            response: ["address"]
        };
    },

    async getAllWorkersAvailability() {
        return {success: true, response: []};
    },

    async deployCalendar(version, token) {
        return;
    }
};




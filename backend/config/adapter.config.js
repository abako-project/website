/**
 * API Configuration
 * Centraliza las URLs y configuración para conectar con el backend desplegado
 */

// dotenv se carga en bin/www, no es necesario cargarla aquí
const BASE_URL = process.env.BACKEND_API_URL || 'https://dev.abako.xyz';

const calendarAddress = "Dd34LSU53MLwJpq4wfHmDFwAifJrcaPbd1qTCGZcR7iXQkd";

module.exports = {
    baseURL: BASE_URL,


    // Adapter API (NestJS - Port 4000)
    adapterAPI: {
        baseURL: `${BASE_URL}/adapter/v1`,
        endpoints: {
            //
            // ---------------- AUTH ----------------
            //
            auth: {
                checkRegistered: (userId) => `/auth/check-registered/${userId}`,
                customRegister: '/auth/custom-register',
                customConnect: '/auth/custom-connect',
                sign: '/auth/sign',
                
            },
            //
            // ---------------- CLIENTS ----------------
            //
            clients: {
                create: '/clients',
                list: '/clients',
                get: (clientId) => `/clients/${clientId}`,
                update: (clientId) => `/clients/${clientId}`,
                attachment: (clientId) => `/clients/${clientId}/attachment`,
                projects: (clientId) => `/clients/${clientId}/projects`
            },
            //
            // ---------------- DEVELOPERS ----------------
            //
            developers: {
                create: '/developers',
                list: '/developers',
                get: (developerId) => `/developers/${developerId}`,
                update: (developerId) => `/developers/${developerId}`,
                attachment: (developerId) => `/developers/${developerId}/attachment`,
                projects: (developerId) => `/developers/${developerId}/projects`,
                milestones: (developerId) => `/developers/${developerId}/milestones`
            },
            //
            // ---------------- PROJECTS ----------------
            //
            projects: {
                update: (projectId) => `/projects/${projectId}`,
                deploy: (version) => `/projects/deploy/${version}`,
                // POST Methods
                assignCoordinator:   (projectId) => `/projects/${projectId}/assign_coordinator`,
                assignTeam:          (projectId) => `/projects/${projectId}/assign_team`,
                markCompleted:       (projectId) => `/projects/${projectId}/mark_completed`,
                submitCoordinatorRatings: (projectId) => `/projects/${projectId}/submit_coordinator_ratings`,
                submitDeveloperRating:    (projectId) => `/projects/${projectId}/submit_developer_rating`,
                setCalendarContract: (projectId) => `/projects/${projectId}/set_calendar_contract`,
                proposeScope:        (projectId) => `/projects/${projectId}/propose_scope`,
                approveScope:        (projectId) => `/projects/${projectId}/approve_scope`,
                rejectScope:         (projectId) => `/projects/${projectId}/reject_scope`,
                coordinatorReject:   (projectId) => `/projects/${projectId}/coordinator_reject`,
                submitTaskForReview: (projectId) => `/projects/${projectId}/submit_task_for_review`,
                completeTask:        (projectId) => `/projects/${projectId}/complete_task`,
                rejectTask:          (projectId, milestoneId) => `/projects/${projectId}/milestones/${milestoneId}/reject`,
                //GET Methods
                getProjectInfo:      (projectId) => `/projects/${projectId}/get_project_info`,
                getTeam:             (projectId) => `/projects/${projectId}/get_team`,
                getScopeInfo:        (projectId) => `/projects/${projectId}/get_scope_info`,
                getTask:             (projectId) => `/projects/${projectId}/get_task`,
                getTaskCompletion:   (projectId) => `/projects/${projectId}/get_task_completion_status`,
                getAllTasks:         (projectId) => `/projects/${projectId}/get_all_tasks`,

                // Milestones
                milestones: {
                    list:      (projectId) => `/projects/${projectId}/milestones`,  // NO EXISTE
                    create:    (projectId) => `/projects/${projectId}/milestones`,  // NO EXISTE
                    get:       (projectId, milestoneId) => `/projects/${projectId}/milestones/${milestoneId}`,  // NO EXISTE
                    update:    (proyectId, milestoneId) => `/projects/${proyectId}/milestones/${milestoneId}`,
                    remove:    (proyectId, milestoneId) => `/projects/${proyectId}/milestones/${milestoneId}`
                }
            },
            //
            // ---------------- CALENDAR ----------------
            //
            calendar: {
                deploy: (version) => `/calendar/deploy/${version}`,
                // POST Methods
                registerWorker:        `/calendar/${calendarAddress}/register_worker`,
                registerWorkers:       `/calendar/${calendarAddress}/register_workers`,
                setAvailability:       `/calendar/${calendarAddress}/set_availability`,
                adminSetAvailability:  `/calendar/${calendarAddress}/admin_set_worker_availability`,
                // GET Methods
                getAvailabilityHours:  `/calendar/${calendarAddress}/get_availability_hours`,
                isAvailable:           `/calendar/${calendarAddress}/is_available`,
                getAvailableWorkers:   `/calendar/${calendarAddress}/get_available_workers`,
                getRegisteredWorkers:  `/calendar/${calendarAddress}/get_registered_workers`,
                getAllWorkersAvailability: `/calendar/${calendarAddress}/get_all_workers_availability`
            },
            //
            // ---------------- RATINGS ----------------
            //
            ratings: {
                clientRatings:     (clientId) =>    `/ratings/client/${clientId}`,
                developerRatings:  (developerId) => `/ratings/developer/${developerId}`,
                projectRatings:    (projectId) =>   `/ratings/project/${projectId}`,
            }
        }
    },

    // VOS Mock API (WebAuthn)
    virtoAPI: {
        baseURL: `${BASE_URL}`,
        endpoints: {
            // WebAuthn flow endpoints
            attestation: '/api/attestation',  // GET - Initialize registration
            register: '/api/register',         // POST - Complete registration
            assertion: '/api/assertion',       // GET - Initialize authentication
            checkUserRegistered: '/api/check-user-registered', // GET - Check if registered
            getUserAddress: '/api/get-user-address', // GET - Get user address
            fund: '/api/fund'                  // POST - Fund address
        }
    },

    // Contracts API (Port 3010)
    contractsAPI: {
        baseURL: `${BASE_URL}`,
        endpoints: {
            health: '/health',
            projects: {
                constructors: '/projects/constructors',
                query: (address, method) => `/projects/query/${address}/${method}`,
                call: (address, method) => `/projects/call/${address}/${method}`,
                deploy: {
                    v5: '/projects/deploy/v5',
                    v6: '/projects/deploy/v6'
                }
            },
            calendar: {
                constructors: '/calendar/constructors',
                query: (method) => `/calendar/query/${calendarAddress}/${method}`,
                call: (method) => `/calendar/call/${calendarAddress}/${method}`,
                deploy: '/calendar/deploy/v5'
            }
        }
    },

    // Request timeout
    timeout: 160000,

    // Request headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }

};
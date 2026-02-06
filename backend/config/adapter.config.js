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
                checkRegistered: (id) => `/auth/check-registered/${id}`,
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
                get: (id) => `/clients/${id}`,
                update: (id) => `/clients/${id}`,
                attachment: (id) => `/clients/${id}/attachment`,
                projects: (id) => `/clients/${id}/projects`
            },
            //
            // ---------------- DEVELOPERS ----------------
            //
            developers: {
                create: '/developers',
                list: '/developers',
                get: (id) => `/developers/${id}`,
                update: (id) => `/developers/${id}`,
                attachment: (id) => `/developers/${id}/attachment`,
                projects: (id) => `/developers/${id}/projects`,
                milestones: (id) => `/developers/${id}/milestones`
            },
            //
            // ---------------- PROJECTS ----------------
            //
            projects: {
                update: (addr) => `/projects/${addr}`,
                deploy: (version) => `/projects/deploy/${version}`,
                // POST Methods
                assignCoordinator:   (addr) => `/projects/${addr}/assign_coordinator`,
                assignTeam:          (addr) => `/projects/${addr}/assign_team`,
                markCompleted:       (addr) => `/projects/${addr}/mark_completed`,
                setCalendarContract: (addr) => `/projects/${addr}/set_calendar_contract`,
                proposeScope:        (id) => `/projects/${id}/propose_scope`,
                approveScope:        (id) => `/projects/${id}/approve_scope`,
                rejectScope:         (id) => `/projects/${id}/reject_scope`,
                coordinatorReject:   (addr) => `/projects/${addr}/coordinator_reject`,
                submitTaskForReview: (id) => `/projects/${id}/submit_task_for_review`,
                completeTask:        (id) => `/projects/${id}/complete_task`,
                rejectTask:          (projectId, milestoneId) => `/projects/${projectId}/milestones/${milestoneId}/reject`,
                //GET Methods
                getProjectInfo:      (id) => `/projects/${id}/get_project_info`,
                getTeam:             (addr) => `/projects/${addr}/get_team`,
                getScopeInfo:        (id) => `/projects/${id}/get_scope_info`,
                getTask:             (addr) => `/projects/${addr}/get_task`,
                getTaskCompletion:   (addr) => `/projects/${addr}/get_task_completion_status`,
                getAllTasks:         (id) => `/projects/${id}/get_all_tasks`,

                // Milestones
                milestones: {
                    list:      (projectId) => `/projects/${projectId}/milestones`,
                    create:    (projectId) => `/projects/${projectId}/milestones`,
                    get:       (projectId, milestoneId) => `/projects/${projectId}/milestones/${milestoneId}`,
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
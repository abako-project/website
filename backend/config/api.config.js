/**
 * API Configuration
 * Centraliza las URLs y configuración para conectar con el backend desplegado
 */

// dotenv se carga en bin/www, no es necesario cargarla aquí
const BASE_URL = process.env.BACKEND_API_URL || 'https://dev.abako.xyz';

module.exports = {
    baseURL: BASE_URL,

    // Adapter API (NestJS - Port 4000)
    adapterAPI: {
        baseURL: `${BASE_URL}`,
        endpoints: {
            // Auth endpoints
            auth: {
                register: '/adapter/v1/auth/register',
                customRegister: '/adapter/v1/auth/custom-register',
                // login: '/adapter/v1/auth/login',
                customConnect: '/adapter/v1/auth/custom-connect',
                logout: '/adapter/v1/auth/logout'
            },
            // Client endpoints
            clients: {
                list: '/adapter/v1/clients',
                get: (id) => `/adapter/v1/clients/${id}`,
                create: '/adapter/v1/clients',
                update: (id) => `/adapter/v1/clients/${id}`,
                findByEmail: '/adapter/v1/clients/find-by-email'
            },
            // Developer endpoints
            developers: {
                list: '/adapter/v1/developers',
                get: (id) => `/adapter/v1/developers/${id}`,
                create: '/adapter/v1/developers',
                update: (id) => `/adapter/v1/developers/${id}`,
                findByEmail: '/adapter/v1/developers/find-by-email'
            },
            // Project endpoints
            projects: {
                list: '/adapter/v1/projects',
                get: (id) => `/adapter/v1/projects/${id}`,
                create: '/adapter/v1/projects',
                update: (id) => `/adapter/v1/projects/${id}`
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
                query: (address, method) => `/calendar/query/${address}/${method}`,
                call: (address, method) => `/calendar/call/${address}/${method}`,
                deploy: '/calendar/deploy/v5'
            }
        }
    },

    // Request timeout
    timeout: 180000,

    // Request headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
};
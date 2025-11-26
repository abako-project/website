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
  // Clients
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

  async createClient(data) {
    try {
      const response = await adapterClient.post(apiConfig.adapterAPI.endpoints.clients.create, data);
      return response.data;
    } catch (error) {
      handleError(error, 'createClient');
    }
  },

  async findClientByEmail(email) {
    try {
      const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.clients.findByEmail, {
        params: { email }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      handleError(error, `findClientByEmail(${email})`);
    }
  },

  async findClientByEmailPassword(email, password) {
    try {
      // Este endpoint debería existir en el backend o usar el de login
      const response = await adapterClient.post('/v1/auth/client/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 404) {
        return null;
      }
      handleError(error, `findClientByEmailPassword(${email})`);
    }
  },

  // Developers
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

  async createDeveloper(data) {
    try {
      const response = await adapterClient.post(apiConfig.adapterAPI.endpoints.developers.create, data);
      return response.data;
    } catch (error) {
      handleError(error, 'createDeveloper');
    }
  },

  async findDeveloperByEmail(email) {
    try {
      const response = await adapterClient.get(apiConfig.adapterAPI.endpoints.developers.findByEmail, {
        params: { email }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      handleError(error, `findDeveloperByEmail(${email})`);
    }
  },

  // Custom Register - Crea la cuenta base
  async customRegister(data) {
    try {
      const response = await adapterClient.post(apiConfig.adapterAPI.endpoints.auth.customRegister, data);
      return response.data;
    } catch (error) {
      handleError(error, 'customRegister');
    }
  }
};

/**
 * VOS Mock API Client Methods (WebAuthn)
 */
const virtoAPI = {
  // Check if user is registered
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

  // Initialize WebAuthn registration (GET attestation options)
  async getAttestationOptions(userId, name) {
    try {
      // Generar challenge (valor aleatorio en hex para prevenir replay attacks)
      const challenge = '0x' + Array.from({ length: 32 }, () => 
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('');
      
      const response = await virtoClient.get(apiConfig.virtoAPI.endpoints.attestation, {
        params: { 
          id: userId, 
          name: name || userId,
          challenge: challenge
        }
      });
      return response.data;
    } catch (error) {
      handleError(error, `getAttestationOptions(${userId})`);
    }
  },

  // Complete WebAuthn registration (POST)
  async customRegister(preparedData) {
    try {
      const response = await virtoClient.post(apiConfig.virtoAPI.endpoints.register, preparedData);
      return response.data;
    } catch (error) {
      handleError(error, 'customRegister');
    }
  },

  // Initialize WebAuthn authentication (GET assertion options)
  async getAssertionOptions(userId) {
    try {
      const response = await virtoClient.get(apiConfig.virtoAPI.endpoints.assertion, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      handleError(error, `getAssertionOptions(${userId})`);
    }
  },

  // Authenticate user (this uses assertion + validation on backend)
  async customConnect(preparedData) {
    try {
      // Note: The VOS Mock API doesn't have a direct "connect" endpoint
      // This would need to be implemented or we use the assertion flow
      const response = await virtoClient.post(apiConfig.virtoAPI.endpoints.assertion, preparedData);
      return response.data;
    } catch (error) {
      handleError(error, 'customConnect');
    }
  },

  // Get user address
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

  // Fund an address
  async fund(address) {
    try {
      const response = await virtoClient.post(apiConfig.virtoAPI.endpoints.fund, { address });
      return response.data;
    } catch (error) {
      handleError(error, `fund(${address})`);
    }
  }
};

/**
 * Contracts API Client Methods
 */
const contractsAPI = {
  async healthCheck() {
    try {
      const response = await contractsClient.get(apiConfig.contractsAPI.endpoints.health);
      return response.data;
    } catch (error) {
      handleError(error, 'healthCheck');
    }
  }
};

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

/**
 * Auth Adapter API
 *
 * Handles authentication operations with the adapter API.
 * Ported from backend/models/adapter.js (checkRegistered, customRegister, customConnect, sign)
 */

import axios from 'axios';
import { adapterConfig, API_TIMEOUT } from '../config';
import { useAuthStore } from '@stores/authStore';

// Create dedicated axios instance for adapter API
const adapterClient = axios.create({
  baseURL: adapterConfig.baseURL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
});

// Add auth interceptor
adapterClient.interceptors.request.use((config) => {
  const { token, user } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (user?.email) {
    config.headers['x-user-email'] = user.email;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Error handling helper
// ---------------------------------------------------------------------------

function handleApiError(error: unknown, context: string): never {
  if (axios.isAxiosError(error)) {
    console.error(`[Adapter API Error] ${context}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });

    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Unknown API error';

    const enhancedError = new Error(errorMessage) as Error & {
      statusCode?: number;
      context: string;
    };
    enhancedError.statusCode = error.response?.status || 500;
    enhancedError.context = context;

    throw enhancedError;
  }

  throw error;
}

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

interface CheckRegisteredResponse {
  registered: boolean;
  [key: string]: unknown;
}

interface CustomRegisterRequest {
  userId: string;
  name: string;
  email: string;
  [key: string]: unknown;
}

interface CustomRegisterResponse {
  success: boolean;
  token?: string;
  [key: string]: unknown;
}

interface CustomConnectRequest {
  userId: string;
  [key: string]: unknown;
}

interface CustomConnectResponse {
  success: boolean;
  token?: string;
  [key: string]: unknown;
}

interface SignRequest {
  extrinsic: string;
  [key: string]: unknown;
}

interface SignResponse {
  signature: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Auth API methods
// ---------------------------------------------------------------------------

/**
 * Check if a user is already registered in the adapter API.
 */
export async function checkRegistered(userId: string): Promise<CheckRegisteredResponse> {
  try {
    const response = await adapterClient.get<CheckRegisteredResponse>(
      adapterConfig.endpoints.auth.checkRegistered(userId)
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `checkRegistered(${userId})`);
  }
}

/**
 * Register a new user with the adapter API.
 */
export async function customRegister(data: CustomRegisterRequest): Promise<CustomRegisterResponse> {
  try {
    const response = await adapterClient.post<CustomRegisterResponse>(
      adapterConfig.endpoints.auth.customRegister,
      data
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'customRegister');
  }
}

/**
 * Connect/login an existing user with the adapter API.
 */
export async function customConnect(data: CustomConnectRequest): Promise<CustomConnectResponse> {
  try {
    const response = await adapterClient.post<CustomConnectResponse>(
      adapterConfig.endpoints.auth.customConnect,
      data
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'customConnect');
  }
}

/**
 * Sign an extrinsic with the user's credentials.
 * This function accepts an explicit token parameter that may differ from the stored auth token.
 */
export async function sign(extrinsicData: SignRequest, token: string): Promise<SignResponse> {
  try {
    const response = await adapterClient.post<SignResponse>(
      adapterConfig.endpoints.auth.sign,
      extrinsicData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'sign');
  }
}

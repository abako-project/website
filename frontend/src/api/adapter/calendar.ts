/**
 * Calendar Adapter API
 *
 * Handles calendar/availability operations with the adapter API.
 * Ported from backend/models/adapter.js (registerWorker, setAvailability, getAvailableWorkers, etc.)
 */

import { adapterClient, handleApiError } from './client';
import { adapterConfig } from '../config';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

interface RegisterWorkerResponse {
  success: boolean;
  [key: string]: unknown;
}

interface SetAvailabilityResponse {
  success: boolean;
  [key: string]: unknown;
}

interface RegisterWorkersResponse {
  success: boolean;
  [key: string]: unknown;
}

interface AdminSetWorkerAvailabilityResponse {
  success: boolean;
  [key: string]: unknown;
}

interface GetAvailabilityHoursResponse {
  hours: number;
  [key: string]: unknown;
}

interface IsAvailableResponse {
  available: boolean;
  [key: string]: unknown;
}

interface GetAvailableWorkersResponse {
  workers: string[];
  [key: string]: unknown;
}

interface GetRegisteredWorkersResponse {
  workers: string[];
  [key: string]: unknown;
}

interface GetAllWorkersAvailabilityResponse {
  availability: Record<string, unknown>;
  [key: string]: unknown;
}

interface DeployCalendarResponse {
  contractAddress: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Calendar API methods
// ---------------------------------------------------------------------------

/**
 * Register a worker in the calendar contract.
 */
export async function registerWorker(worker: string, token: string): Promise<RegisterWorkerResponse> {
  try {
    const response = await adapterClient.post<RegisterWorkerResponse>(
      adapterConfig.endpoints.calendar.registerWorker,
      { worker },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'registerWorker()');
  }
}

/**
 * Set availability for the current user.
 *
 * Payload format matches the old Express backend (adapter.js on main):
 *   { availability: { type: availabilityType, value: weeklyHours } }
 */
export async function setAvailability(
  availability: string,
  weeklyHours: number | undefined,
  token: string
): Promise<SetAvailabilityResponse> {
  try {
    const response = await adapterClient.post<SetAvailabilityResponse>(
      adapterConfig.endpoints.calendar.setAvailability,
      {
        availability: {
          type: availability,
          value: weeklyHours,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `setAvailability(${availability})`);
  }
}

/**
 * Register multiple workers in the calendar contract.
 */
export async function registerWorkers(
  workers: string[],
  token: string
): Promise<RegisterWorkersResponse> {
  try {
    const response = await adapterClient.post<RegisterWorkersResponse>(
      adapterConfig.endpoints.calendar.registerWorkers,
      { workers },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'registerWorkers()');
  }
}

/**
 * Admin: Set worker availability for a specific worker.
 */
export async function adminSetWorkerAvailability(
  worker: string,
  availability: unknown,
  token: string
): Promise<AdminSetWorkerAvailabilityResponse> {
  try {
    const response = await adapterClient.post<AdminSetWorkerAvailabilityResponse>(
      adapterConfig.endpoints.calendar.adminSetAvailability,
      { worker, availability },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'adminSetWorkerAvailability()');
  }
}

/**
 * Get availability hours for a specific worker.
 */
export async function getAvailabilityHours(worker: string): Promise<GetAvailabilityHoursResponse> {
  try {
    const response = await adapterClient.get<GetAvailabilityHoursResponse>(
      adapterConfig.endpoints.calendar.getAvailabilityHours,
      { params: { worker } }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'getAvailabilityHours()');
  }
}

/**
 * Check if a worker is available (optionally with minimum hours requirement).
 */
export async function isAvailable(worker: string, minHours?: number): Promise<IsAvailableResponse> {
  try {
    const params: Record<string, unknown> = { worker };
    if (minHours !== undefined) {
      params.min_hours = minHours;
    }

    const response = await adapterClient.get<IsAvailableResponse>(
      adapterConfig.endpoints.calendar.isAvailable,
      { params }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'isAvailable()');
  }
}

/**
 * Get all available workers (optionally filtered by minimum hours).
 */
export async function getAvailableWorkers(minHours?: number): Promise<GetAvailableWorkersResponse> {
  try {
    const params: Record<string, unknown> = {};
    if (minHours !== undefined) {
      params.min_hours = minHours;
    }

    const response = await adapterClient.get<GetAvailableWorkersResponse>(
      adapterConfig.endpoints.calendar.getAvailableWorkers,
      { params }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'getAvailableWorkers()');
  }
}

/**
 * Get all registered workers in the calendar.
 */
export async function getRegisteredWorkers(): Promise<GetRegisteredWorkersResponse> {
  try {
    const response = await adapterClient.get<GetRegisteredWorkersResponse>(
      adapterConfig.endpoints.calendar.getRegisteredWorkers
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'getRegisteredWorkers()');
  }
}

/**
 * Get availability information for all workers.
 */
export async function getAllWorkersAvailability(): Promise<GetAllWorkersAvailabilityResponse> {
  try {
    const response = await adapterClient.get<GetAllWorkersAvailabilityResponse>(
      adapterConfig.endpoints.calendar.getAllWorkersAvailability
    );
    return response.data;
  } catch (error) {
    handleApiError(error, 'getAllWorkersAvailability()');
  }
}

/**
 * Deploy a new calendar contract.
 */
export async function deployCalendar(version: string, token: string): Promise<DeployCalendarResponse> {
  try {
    const response = await adapterClient.post<DeployCalendarResponse>(
      adapterConfig.endpoints.calendar.deploy(version),
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error, `deployCalendar(${version})`);
  }
}

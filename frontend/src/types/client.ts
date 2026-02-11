/**
 * Client Types
 *
 * Derived from:
 *   - backend/models/seda/client.js (cleanClient removes _id, __v, imageData, imageMimeType, projects, createdAt, updatedAt)
 *   - backend/models/adapter.js (createClient, updateClient params)
 *   - backend/controllers/client.js (what gets passed to views)
 *
 * After cleanClient, the remaining fields on a client object are:
 *   id, email, name, company, department, website, description, location, languages
 */

import type { LanguageCode } from './enums';

/**
 * A client profile as returned by the SEDA layer after cleanup.
 * The `id` field is the backend-generated identifier (from the adapter API).
 */
export interface Client {
  id: string;
  email: string;
  name: string;
  company?: string;
  department?: string;
  website?: string;
  description?: string;
  location?: string;
  languages?: LanguageCode[];
}

/**
 * Data required to create a new client.
 * Maps to adapterAPI.createClient(email, name, company, department, website, description, location, languages, image).
 */
export interface ClientCreateData {
  email: string;
  name: string;
  company?: string;
  department?: string;
  website?: string;
  description?: string;
  location?: string;
  languages?: LanguageCode[];
}

/**
 * Data accepted for updating an existing client.
 * Maps to adapterAPI.updateClient(clientId, data, image).
 * See backend/controllers/client.js update action.
 */
export interface ClientUpdateData {
  name?: string;
  company?: string;
  department?: string;
  website?: string;
  description?: string;
  location?: string;
  languages?: LanguageCode[];
}

/**
 * Client attachment metadata returned by adapterAPI.getClientAttachment.
 * Returns null if no image exists (404).
 */
export interface ClientAttachment {
  mime: string;
  image: ArrayBuffer;
}

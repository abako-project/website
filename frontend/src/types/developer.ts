/**
 * Developer Types
 *
 * Derived from:
 *   - backend/models/seda/developer.js (cleanDeveloper removes _id, __v, imageData, imageMimeType, createdAt, updatedAt)
 *   - backend/models/adapter.js (createDeveloper, updateDeveloper params)
 *   - backend/controllers/developer.js (what gets passed to views)
 *
 * After cleanDeveloper, the remaining fields on a developer object are:
 *   id, email, name, bio, background, role, proficiency,
 *   githubUsername, portfolioUrl, location,
 *   skills, languages, availability, availableHoursPerWeek,
 *   isAvailableForHire
 */

import type { LanguageCode } from './enums';

/**
 * A developer profile as returned by the SEDA layer after cleanup.
 */
export interface Developer {
  id: string;
  email: string;
  name: string;
  bio?: string;
  background?: string;
  role?: string | null;
  proficiency?: string | null;
  githubUsername?: string;
  portfolioUrl?: string;
  location?: string;
  skills?: string[];
  languages?: LanguageCode[];
  availability?: string;
  availableHoursPerWeek?: number;
  isAvailableForHire?: boolean;
  /** Populated at runtime when resolving project team membership. */
  developerWorkerAddress?: string;
}

/**
 * Data required to create a new developer.
 * Maps to adapterAPI.createDeveloper(email, name, githubUsername, portfolioUrl, image).
 */
export interface DeveloperCreateData {
  email: string;
  name: string;
  githubUsername?: string;
  portfolioUrl?: string;
}

/**
 * Data accepted for updating an existing developer.
 * Maps to backend/controllers/developer.js update action.
 */
export interface DeveloperUpdateData {
  name?: string;
  bio?: string;
  background?: string;
  role?: string | null;
  proficiency?: string | null;
  githubUsername?: string;
  portfolioUrl?: string;
  location?: string;
  skills?: string[];
  languages?: LanguageCode[];
  availability?: string;
  availableHoursPerWeek?: number;
  isAvailableForHire?: boolean;
}

/**
 * Developer attachment metadata returned by adapterAPI.getDeveloperAttachment.
 * Returns null if no image exists (404).
 */
export interface DeveloperAttachment {
  mime: string;
  image: ArrayBuffer;
}

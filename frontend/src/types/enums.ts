/**
 * Enum / Reference Data Types
 *
 * Derived from the static JSON files under backend/models/enums/.
 * These are served by GET /api/enums as a single aggregate response.
 *
 * The enum values are string arrays (or key-value maps for languages).
 * We use readonly tuples for the known values so that TypeScript can
 * narrow them, and export union types derived from those tuples.
 */

// ---------------------------------------------------------------------------
// Budget options (backend/models/enums/budgets.json)
// ---------------------------------------------------------------------------

export const BUDGETS = [
  'Below $10,000',
  '$10,000 - $50,000',
  '$50,000 - $100,000',
  'Above $100,000',
] as const;

export type Budget = (typeof BUDGETS)[number];

// ---------------------------------------------------------------------------
// Delivery time options (backend/models/enums/deliveryTimes.json)
// ---------------------------------------------------------------------------

export const DELIVERY_TIMES = [
  'Within 1 month',
  '1-3 months from start',
  '3-6 months from start',
  'Specific date',
] as const;

export type DeliveryTime = (typeof DELIVERY_TIMES)[number];

// ---------------------------------------------------------------------------
// Project type options (backend/models/enums/projectTypes.json)
// ---------------------------------------------------------------------------

export const PROJECT_TYPES = [
  'Other',
  'Smart Contract',
  'Frontend',
  'MVP',
  'Audit',
  'Mobile App',
] as const;

export type ProjectType = (typeof PROJECT_TYPES)[number];

// ---------------------------------------------------------------------------
// Skills (backend/models/enums/skills.json)
// ---------------------------------------------------------------------------

export const SKILLS = [
  'Rust',
  'Javascript',
  'HTML5',
  'Node',
  'UX',
] as const;

export type Skill = (typeof SKILLS)[number];

// ---------------------------------------------------------------------------
// Roles (backend/models/enums/roles.json)
// ---------------------------------------------------------------------------

export const ROLES = [
  'Front End',
  'BackEnd',
  'Full Stack',
  'UX Designer',
] as const;

export type Role = (typeof ROLES)[number];

// ---------------------------------------------------------------------------
// Availability (backend/models/enums/availability.json)
// ---------------------------------------------------------------------------

export const AVAILABILITY_OPTIONS = [
  'NotAvailable',
  'PartTime',
  'FullTime',
  'WeeklyHours',
] as const;

export type Availability = (typeof AVAILABILITY_OPTIONS)[number];

// ---------------------------------------------------------------------------
// Languages (backend/models/enums/languages.json)
// A key-value map where key = ISO code and value = human name.
// ---------------------------------------------------------------------------

export type LanguageCode = string;
export type LanguageName = string;

/** The full languages map: { "ENG": "English", "SPA": "Spanish", ... } */
export type LanguagesMap = Record<LanguageCode, LanguageName>;

// ---------------------------------------------------------------------------
// Proficiency levels (backend/models/enums/proficiency.json)
// ---------------------------------------------------------------------------

export const PROFICIENCY_LEVELS = [
  'junior',
  'mid-level',
  'senior',
] as const;

export type Proficiency = (typeof PROFICIENCY_LEVELS)[number];

// ---------------------------------------------------------------------------
// Aggregate enums response from GET /api/enums
// ---------------------------------------------------------------------------

/**
 * The shape returned by GET /api/enums.
 * All enum data in a single response.
 */
export interface EnumsResponse {
  budgets: readonly string[];
  deliveryTimes: readonly string[];
  projectTypes: readonly string[];
  skills: readonly string[];
  roles: readonly string[];
  availability: readonly string[];
  languages: LanguagesMap;
  proficiency: readonly string[];
}

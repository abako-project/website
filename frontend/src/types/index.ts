/**
 * Type Re-exports
 *
 * Barrel file that re-exports all domain types from a single entry point.
 * Import types with: import { User, Project, Milestone } from '@/types/index';
 */

// User and authentication
export type {
  User,
  UserRole,
  LoginCredentials,
  LoginResponse,
  MeResponse,
  LogoutResponse,
  RegisterCredentials,
  RegisterResponse,
} from './user';

// Client
export type {
  Client,
  ClientUpdateData,
} from './client';

// Developer
export type {
  Developer,
  DeveloperUpdateData,
} from './developer';

// Project and milestones
export type {
  Project,
  Milestone,
  ProjectRawState,
  MilestoneRawState,
  ScopeSession,
  ProposalCreateData,
  ProposalUpdateData,
  MilestoneFormData,
  ProposeScopeData,
  ProjectComment,
} from './project';

// Enums
export {
  BUDGETS,
  DELIVERY_TIMES,
  PROJECT_TYPES,
  SKILLS,
  ROLES,
  AVAILABILITY_OPTIONS,
  PROFICIENCY_LEVELS,
} from './enums';

export type {
  Budget,
  DeliveryTime,
  ProjectType,
  Skill,
  Role,
  Availability,
  LanguageCode,
  LanguageName,
  LanguagesMap,
  Proficiency,
  EnumsResponse,
} from './enums';

// Payments, votes, and milestone workflow
export type {
  PaymentsResponse,
  PaymentDetailResponse,
  ReleasePaymentResponse,
  ProjectPaymentSummary,
  VoteMember,
  VotesResponse,
  VoteEntry,
  SubmitVotesResponse,
} from './payment';

// Ratings
export type {
  RatingResponse,
  DeveloperRatingsResponse,
  ClientRatingsResponse,
} from './rating';

// API response types
export type {
  ApiError,
  ApiErrorResponse,
} from './api';

export { isApiError } from './api';

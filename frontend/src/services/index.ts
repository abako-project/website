/**
 * Services Barrel Export
 *
 * Re-exports all service layer functions from a single entry point.
 * Services provide business logic and data composition on top of raw API calls.
 *
 * Import example:
 *   import { getProject, createProposal, clientConnect } from '@/services';
 */

// Project service
export {
  getProject,
  getProjectsIndex,
  getProjectClientId,
  getProjectConsultantId,
  getProjectContractAddress,
  rejectProposal,
  projectCompleted,
  assignProjectTeam,
  getProjectTeam,
  getProjectScopeInfo,
  getProjectAllTasks,
  getProjectTask,
  completeProjectTask,
  getProjectTaskCompletionStatus,
  updateProjectData,
  setProjectCalendarContract,
  submitCoordinatorRatings,
  submitDeveloperRating,
} from './projectService';

// Proposal service
export {
  createProposal,
  updateProposal,
} from './proposalService';

// Client service
export {
  clientConnect,
  getClientIndex,
  getClientById,
  cleanClient,
  createClient,
  updateClient,
  findClientByEmail,
  getClientAttachment,
} from './clientService';

// Developer service
export {
  developerConnect,
  getDeveloperIndex,
  getDeveloperById,
  cleanDeveloper,
  getProjectDevelopers,
  createDeveloper,
  updateDeveloper,
  findDeveloperByEmail,
  getDeveloperAttachment,
} from './developerService';

// Milestone service
export {
  getMilestones,
  cleanMilestone,
  getMilestone,
  addMilestoneToScope,
  updateMilestone,
  swapMilestoneOrder,
  destroyMilestone,
  submitMilestoneForReview,
  acceptMilestoneSubmission,
  rejectMilestoneSubmission,
} from './milestoneService';

// Scope service
export {
  submitScope,
  acceptScope,
  rejectScope,
} from './scopeService';

// Rating service
export {
  getDeveloperRatings,
  getClientRatings,
  getProjectRatings,
} from './ratingService';

// Calendar service
export {
  getRegisteredWorkers,
  getWorkersAvailability,
  getWorkerAddress,
  ensureWorkerRegistered,
  deployCalendarContract,
  registerMultipleWorkers,
  setWorkerAvailability,
  getWorkerAvailabilityHours,
  checkWorkerAvailability,
  getAvailableWorkersList,
  getAllWorkersAvailabilityData,
} from './calendarService';

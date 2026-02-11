/**
 * Project Service Layer
 *
 * Port of backend/models/seda/project.js to TypeScript.
 * Provides business logic and data composition on top of raw API calls.
 *
 * Key functions:
 * - getProject: Aggregates project data with client, consultant, milestones
 * - getProjectsIndex: Fetches and enriches all projects (optimized with Promise.allSettled)
 * - Thin wrappers around adapter API methods
 */

import {
  getProjectInfo,
  getClients,
  getDevelopers,
  getAllTasks,
  getClientProjects,
  getDeveloperProjects,
  getDeveloperMilestones,
  coordinatorRejectProject,
  markCompleted,
  assignTeam,
  getTeam,
  getScopeInfo,
  getTask,
  completeTask,
  getTaskCompletionStatus,
  updateProject,
  setCalendarContract,
} from '@/api/adapter';

import type { Project, Milestone, Client, Developer } from '@/types';

// ---------------------------------------------------------------------------
// Helper: Clean project object (remove mongo fields, add id)
// ---------------------------------------------------------------------------

function cleanProject(project: Record<string, unknown>): void {
  if (project._id) {
    project.id = project._id;
    delete project._id;
  }
  delete project.__v;
}

// ---------------------------------------------------------------------------
// Helper: Clean milestone object (remove mongo fields)
// ---------------------------------------------------------------------------

function cleanMilestone(milestone: Record<string, unknown>): void {
  delete milestone._id;
  delete milestone.__v;
  delete milestone.createdAt;
  delete milestone.updatedAt;
}

// ---------------------------------------------------------------------------
// Main aggregation function: Get full project with all relations
// ---------------------------------------------------------------------------

/**
 * Returns complete project data including client, consultant, milestones.
 * This is the main data composition function that enriches raw API data.
 *
 * @param projectId - Project ID
 * @returns Fully enriched project object
 */
export async function getProject(projectId: string): Promise<Project> {
  // 1. Fetch project info
  const project = await getProjectInfo(projectId) as Record<string, unknown>;

  // 2. Fetch clients and developers in parallel
  const [{ clients }, { developers }] = await Promise.all([
    getClients(),
    getDevelopers(),
  ]);

  // 3. Fetch milestones if project is created
  let milestones: Array<Record<string, unknown>> = [];
  if (project.creationStatus === 'created') {
    const response = await getAllTasks(projectId);
    milestones = (response.milestones || []) as Array<Record<string, unknown>>;
    milestones.forEach(cleanMilestone);
  }

  // 4. Clean up project fields
  cleanProject(project);

  // 5. Enrich: Add client reference
  project.client = clients.find((c: Client) => c.id === project.clientId);

  // 6. Enrich: Add consultant reference (if assigned)
  if (project.consultantId) {
    project.consultant = developers.find(
      (d: Developer) => d.id === project.consultantId
    );
  }

  // 7. Enrich: Add developer references to milestones
  milestones.forEach((m) => {
    if (m.developerId) {
      m.developer = developers.find((d: Developer) => d.id === m.developerId);
    }
  });

  // 8. Set additional properties
  project.milestones = milestones;
  project.objectives = [];
  project.constraints = [];

  return project as unknown as Project;
}

// ---------------------------------------------------------------------------
// Projects index: Get all projects or filter by client/developer
// ---------------------------------------------------------------------------

/**
 * Returns a list of projects, optionally filtered by client or developer.
 * OPTIMIZED: Uses Promise.allSettled to fetch all client projects in parallel.
 *
 * Original backend code had N+1 problem (~47 HTTP calls).
 * This version parallelizes client/developer project fetches.
 *
 * @param clientId - Optional client ID filter
 * @param developerId - Optional developer ID filter
 * @returns List of enriched projects
 */
export async function getProjectsIndex(
  clientId?: string,
  developerId?: string
): Promise<Project[]> {
  let projects: Array<Record<string, unknown>> = [];

  // Fetch clients and developers in parallel
  const [{ clients }, { developers }] = await Promise.all([
    getClients(),
    getDevelopers(),
  ]);

  if (clientId) {
    // Simple case: just fetch one client's projects
    projects = await getClientProjects(clientId) as Array<Record<string, unknown>>;
  } else {
    // Fetch ALL client projects in parallel (optimization!)
    const clientProjectPromises = clients.map((c: Client) =>
      getClientProjects(c.id)
    );
    const clientResults = await Promise.allSettled(clientProjectPromises);

    // Deduplicate by _id
    const projectIds = new Set<string>();
    clientResults.forEach((result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        (result.value as Array<Record<string, unknown>>).forEach((project) => {
          const id = project._id as string;
          if (!projectIds.has(id)) {
            projectIds.add(id);
            projects.push(project);
          }
        });
      }
    });

    // Also fetch developer projects in parallel
    const developerProjectPromises = developers.map((d: Developer) =>
      getDeveloperProjects(d.id)
    );
    const developerResults = await Promise.allSettled(developerProjectPromises);

    developerResults.forEach((result) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        (result.value as Array<Record<string, unknown>>).forEach((project) => {
          const id = project._id as string;
          if (!projectIds.has(id)) {
            projectIds.add(id);
            projects.push(project);
          }
        });
      }
    });

    // Filter by developerId if provided
    if (developerId) {
      // Get milestones where this developer is assigned
      const { milestones: developerMilestones } = await getDeveloperMilestones(
        developerId
      );

      // Extract project IDs where developer is assigned
      const developerProjectIds = (developerMilestones as Array<Record<string, unknown>>).map(
        (m) => (m.project as Record<string, unknown>)?._id as string
      );

      // Filter: developer is consultant OR developer in milestones
      projects = projects.filter(
        (proj) =>
          proj.consultantId === developerId || developerProjectIds.includes(proj._id as string)
      );
    }
  }

  // Enrich all projects (fetch milestones in parallel too!)
  const milestonePromises = projects.map((project) => {
    if (project.creationStatus === 'created') {
      return getAllTasks((project._id || project.id) as string);
    }
    return Promise.resolve({ milestones: [] });
  });

  const milestoneResults = await Promise.allSettled(milestonePromises);

  // Process each project
  projects.forEach((project, index: number) => {
    // Clean project fields
    cleanProject(project);

    // Enrich: Add client reference
    project.client = clients.find((c: Client) => c.id === project.clientId);

    // Enrich: Add consultant reference
    if (project.consultantId) {
      project.consultant = developers.find(
        (d: Developer) => d.id === project.consultantId
      );
    }

    // Enrich: Add milestones
    const milestoneResult = milestoneResults[index];
    let milestones: Array<Record<string, unknown>> = [];
    if (milestoneResult && milestoneResult.status === 'fulfilled') {
      const value = milestoneResult.value;
      if (value && 'milestones' in value && Array.isArray(value.milestones)) {
        milestones = value.milestones as Array<Record<string, unknown>>;
        milestones.forEach((m) => {
          cleanMilestone(m);
          if (m.developerId) {
            m.developer = developers.find(
              (d: Developer) => d.id === m.developerId
            );
          }
        });
      }
    }

    project.milestones = milestones;
    project.objectives = [];
    project.constraints = [];
  });

  return projects as unknown as Project[];
}

// ---------------------------------------------------------------------------
// Thin wrappers: Extract specific project properties
// ---------------------------------------------------------------------------

/**
 * Returns the client ID for a given project.
 */
export async function getProjectClientId(projectId: string): Promise<string> {
  const project = await getProjectInfo(projectId) as Record<string, unknown>;
  if (project && project.clientId) {
    return project.clientId as string;
  }
  throw new Error(`There is no project with id=${projectId}`);
}

/**
 * Returns the consultant ID for a given project (may be undefined).
 */
export async function getProjectConsultantId(
  projectId: string
): Promise<string | undefined> {
  const project = await getProjectInfo(projectId) as Record<string, unknown>;
  return project?.consultantId as string | undefined;
}

/**
 * Returns the contract address for a given project (may be undefined).
 */
export async function getProjectContractAddress(
  projectId: string
): Promise<string | undefined> {
  const project = await getProjectInfo(projectId) as Record<string, unknown>;
  return project?.contractAddress as string | undefined;
}

// ---------------------------------------------------------------------------
// Thin wrappers: Project workflow actions
// ---------------------------------------------------------------------------

/**
 * Coordinator rejects a project proposal.
 */
export async function rejectProposal(
  projectId: string,
  proposalRejectionReason: string,
  token: string
): Promise<void> {
  await coordinatorRejectProject(projectId, proposalRejectionReason, token);
}

/**
 * Mark a project as completed with optional ratings.
 */
export async function projectCompleted(
  projectId: string,
  ratings?: unknown[],
  token?: string
): Promise<void> {
  await markCompleted(projectId, ratings || [], token || '');
}

/**
 * Assign a team to the project.
 */
export async function assignProjectTeam(
  contractAddress: string,
  teamSize: number,
  token: string
): Promise<unknown> {
  try {
    return await assignTeam(contractAddress, teamSize, token);
  } catch (error) {
    console.error(`[Project Service] Error assigning team:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get team information for a project.
 */
export async function getProjectTeam(contractAddress: string): Promise<unknown> {
  try {
    return await getTeam(contractAddress);
  } catch (error) {
    console.error(`[Project Service] Error getting team:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get scope information for a project.
 */
export async function getProjectScopeInfo(
  contractAddress: string
): Promise<unknown> {
  try {
    return await getScopeInfo(contractAddress);
  } catch (error) {
    console.error(`[Project Service] Error getting scope info:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get all tasks for a project.
 */
export async function getProjectAllTasks(
  contractAddress: string
): Promise<Milestone[]> {
  try {
    const response = await getAllTasks(contractAddress);
    const milestones: Array<Record<string, unknown>> = (response.milestones || []) as Array<Record<string, unknown>>;
    milestones.forEach(cleanMilestone);
    return milestones as unknown as Milestone[];
  } catch (error) {
    console.error(`[Project Service] Error getting all tasks:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get a specific task for a project.
 */
export async function getProjectTask(
  contractAddress: string,
  taskId: string
): Promise<unknown> {
  try {
    return await getTask(contractAddress, taskId);
  } catch (error) {
    console.error(`[Project Service] Error getting task:`, (error as Error).message);
    throw error;
  }
}

/**
 * Complete a task.
 */
export async function completeProjectTask(
  contractAddress: string,
  taskId: string,
  token: string
): Promise<unknown> {
  try {
    return await completeTask(contractAddress, taskId, token);
  } catch (error) {
    console.error(`[Project Service] Error completing task:`, (error as Error).message);
    throw error;
  }
}

/**
 * Get task completion status.
 */
export async function getProjectTaskCompletionStatus(
  contractAddress: string,
  taskId: string
): Promise<unknown> {
  try {
    return await getTaskCompletionStatus(contractAddress, taskId);
  } catch (error) {
    console.error(
      `[Project Service] Error getting task completion status:`,
      (error as Error).message
    );
    throw error;
  }
}

/**
 * Update project data.
 */
export async function updateProjectData(
  contractAddress: string,
  data: Record<string, unknown>,
  token: string
): Promise<unknown> {
  try {
    return await updateProject(contractAddress, data, token);
  } catch (error) {
    console.error(`[Project Service] Error updating project:`, (error as Error).message);
    throw error;
  }
}

/**
 * Set calendar contract for a project.
 */
export async function setProjectCalendarContract(
  contractAddress: string,
  calendarContractAddress: string,
  token: string
): Promise<unknown> {
  try {
    return await setCalendarContract(
      contractAddress,
      calendarContractAddress,
      token
    );
  } catch (error) {
    console.error(
      `[Project Service] Error setting calendar contract:`,
      (error as Error).message
    );
    throw error;
  }
}

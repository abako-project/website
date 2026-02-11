/**
 * Milestone Service
 *
 * Business logic for milestone operations.
 * Ported from backend/models/seda/milestone.js
 *
 * This service layer wraps the adapter API and provides additional
 * business logic like cleaning milestone data and managing scope session state.
 */

import {
  getAllTasks,
  getTask,
  updateMilestone as apiUpdateMilestone,
  deleteMilestone,
  submitTaskForReview,
  completeTask,
  rejectTask,
} from '@/api/adapter';

import type { MilestoneFormData, ScopeSession } from '@/types';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

interface ApiTasksResponse {
  milestones?: Record<string, unknown>[];
  tasks?: Record<string, unknown>[];
  [key: string]: unknown;
}

interface ApiTaskResponse {
  milestone?: Record<string, unknown>;
  task?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ApiMilestoneResponse {
  milestone?: Record<string, unknown>;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Get all milestones for a project.
 *
 * @param projectId - Project ID or contract address
 * @returns Array of cleaned milestone objects
 */
export async function getMilestones(projectId: string): Promise<Record<string, unknown>[]> {
  const response = (await getAllTasks(projectId)) as ApiTasksResponse;
  const milestones = response.milestones || response.tasks || [];

  milestones.forEach((milestone) => {
    cleanMilestone(milestone);
  });

  return milestones;
}

/**
 * Remove unwanted properties from a milestone object.
 *
 * Removes database-specific fields that should not be exposed to the frontend.
 *
 * @param milestone - Milestone object to clean (mutated in place)
 */
export function cleanMilestone(milestone: Record<string, unknown>): void {
  delete milestone._id;
  delete milestone.__v;
  delete milestone.createdAt;
  delete milestone.updatedAt;
}

/**
 * Get a single milestone by ID.
 *
 * @param projectId - Project ID or contract address
 * @param milestoneId - Milestone ID
 * @returns Milestone object
 */
export async function getMilestone(
  projectId: string,
  milestoneId: string
): Promise<Record<string, unknown>> {
  const response = (await getTask(projectId, milestoneId)) as ApiTaskResponse;
  return response.milestone || response.task || response;
}

/**
 * Add a milestone to the scope session (local operation, no API call).
 *
 * This is used when building a scope draft before submitting it to the backend.
 * The milestone is stored in the local scope session state (Zustand store or passed reference).
 *
 * @param scope - Scope session object containing the milestones array
 * @param data - Milestone form data to add
 */
export function addMilestoneToScope(scope: ScopeSession, data: MilestoneFormData): void {
  const milestoneData = {
    title: data.title,
    description: data.description,
    budget: data.budget,
    deliveryTime: data.deliveryTime,
    deliveryDate: data.deliveryDate,
    role: data.role,
    proficiency: data.proficiency,
    skills: data.skills,
    availability: data.availability,
  };

  scope.milestones.push(milestoneData);
}

/**
 * Update an existing milestone.
 *
 * @param projectId - Project ID or contract address
 * @param milestoneId - Milestone ID
 * @param data - Updated milestone data
 * @param token - Authentication token
 * @returns Updated milestone object
 */
export async function updateMilestone(
  projectId: string,
  milestoneId: string,
  data: MilestoneFormData,
  token: string
): Promise<Record<string, unknown>> {
  const milestoneData: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    budget: data.budget ?? undefined,
    deliveryTime: data.deliveryTime,
    deliveryDate: data.deliveryDate,
    role: data.role ?? undefined,
    proficiency: data.proficiency ?? undefined,
    skills: data.skills,
    availability: data.availability,
  };

  const response = (await apiUpdateMilestone(
    projectId,
    milestoneId,
    milestoneData,
    token
  )) as ApiMilestoneResponse;

  return response.milestone || response;
}

/**
 * Swap the order of two milestones in the scope session (local operation).
 *
 * This is used when reordering milestones in the scope draft before submission.
 *
 * @param scope - Scope session object containing the milestones array
 * @param index1 - Index of first milestone
 * @param index2 - Index of second milestone
 */
export function swapMilestoneOrder(scope: ScopeSession, index1: number, index2: number): void {
  const milestones = scope.milestones;
  const milestone1 = milestones[index1];
  const milestone2 = milestones[index2];

  if (milestone1 && milestone2) {
    milestones[index1] = milestone2;
    milestones[index2] = milestone1;
  }
}

/**
 * Delete a milestone.
 *
 * @param projectId - Project ID or contract address
 * @param milestoneId - Milestone ID
 * @param token - Authentication token
 */
export async function destroyMilestone(
  projectId: string,
  milestoneId: string,
  token: string
): Promise<void> {
  await deleteMilestone(projectId, milestoneId, token);
}

/**
 * Submit a milestone for review (developer/consultant action).
 *
 * @param projectId - Project ID or contract address
 * @param milestoneId - Milestone ID
 * @param token - Authentication token
 */
export async function submitMilestoneForReview(
  projectId: string,
  milestoneId: string,
  token: string
): Promise<void> {
  await submitTaskForReview(projectId, milestoneId, token);
}

/**
 * Accept a milestone submission (client action).
 *
 * Marks the milestone as completed.
 *
 * @param projectId - Project ID or contract address
 * @param milestoneId - Milestone ID
 * @param _comment - Comment from client (currently unused by the API)
 * @param token - Authentication token
 */
export async function acceptMilestoneSubmission(
  projectId: string,
  milestoneId: string,
  _comment: string,
  token: string
): Promise<void> {
  await completeTask(projectId, milestoneId, token);
}

/**
 * Reject a milestone submission (client action).
 *
 * Sends the milestone back to in-progress state with rejection reason.
 *
 * @param projectId - Project ID or contract address
 * @param milestoneId - Milestone ID
 * @param comment - Rejection reason
 * @param token - Authentication token
 */
export async function rejectMilestoneSubmission(
  projectId: string,
  milestoneId: string,
  comment: string,
  token: string
): Promise<void> {
  await rejectTask(projectId, milestoneId, comment, token);
}

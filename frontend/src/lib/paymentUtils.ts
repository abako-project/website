/**
 * Payment Utility Functions
 *
 * Client-side payment calculation logic that mirrors the EJS template
 * in views/payments/__paymentGridProject.ejs.
 *
 * Milestones are categorized into payment groups based on their state:
 *   - Zero-paid: not yet started (CreatingMilestone, WaitingDeveloperAssignation)
 *   - Advance-paid: in progress (MilestoneInProgress, WaitingClientAcceptSubmission,
 *                    MilestoneCompleted, SubmissionRejectedByClient)
 *   - Fully-paid: payment released (Paid)
 */

import { flowMilestoneState, MilestoneState } from '@lib/flowStates';
import type { Project, Milestone, ProjectPaymentSummary } from '@/types/index';

/**
 * States where the milestone has zero payment.
 */
const ZERO_PAID_STATES: ReadonlySet<string> = new Set([
  MilestoneState.CreatingMilestone,
  MilestoneState.WaitingDeveloperAssignation,
]);

/**
 * States where the milestone has received an advance payment.
 */
const ADVANCED_PAID_STATES: ReadonlySet<string> = new Set([
  MilestoneState.MilestoneInProgress,
  MilestoneState.WaitingClientAcceptSubmission,
  MilestoneState.MilestoneCompleted,
  MilestoneState.SubmissionRejectedByClient,
]);

/**
 * States where the milestone has been fully paid.
 */
const FULLY_PAID_STATES: ReadonlySet<string> = new Set([
  MilestoneState.Paid,
]);

/**
 * Extracts the numeric budget from a milestone.
 * Handles string, number, and null/undefined values.
 */
function getMilestoneBudget(milestone: Milestone): number {
  if (milestone.budget === null || milestone.budget === undefined) {
    return 0;
  }
  const val = typeof milestone.budget === 'string'
    ? parseFloat(milestone.budget)
    : milestone.budget;
  return isNaN(val) ? 0 : val;
}

/**
 * Computes the payment summary for a single project.
 *
 * Mirrors the calculation logic from views/payments/__paymentGridProject.ejs.
 *
 * @param project - The project with milestones.
 * @param advancePaymentPercentage - Percentage of budget paid in advance (e.g. 25).
 * @returns The computed payment summary.
 */
export function computeProjectPaymentSummary(
  project: Project,
  advancePaymentPercentage: number
): ProjectPaymentSummary {
  const advancedPaidMilestones: Milestone[] = [];
  const paidMilestones: Milestone[] = [];

  for (const milestone of project.milestones) {
    const state = flowMilestoneState(milestone);
    if (ADVANCED_PAID_STATES.has(state)) {
      advancedPaidMilestones.push(milestone);
    } else if (FULLY_PAID_STATES.has(state)) {
      paidMilestones.push(milestone);
    }
  }

  // Total budget funded = sum of all milestone budgets
  const totalBudgetFunded = Math.round(
    project.milestones.reduce((acc, m) => acc + getMilestoneBudget(m), 0) * 100
  ) / 100;

  // Advance payment = sum of (budget * advancePaymentPercentage / 100) for in-progress milestones
  const paymentInAdvanced = Math.round(
    advancedPaidMilestones.reduce(
      (acc, m) => acc + (getMilestoneBudget(m) * advancePaymentPercentage) / 100,
      0
    ) * 100
  ) / 100;

  // Payment for completed = sum of all paid milestone budgets
  const paymentForCompleted = Math.round(
    paidMilestones.reduce((acc, m) => acc + getMilestoneBudget(m), 0) * 100
  ) / 100;

  // Funds remaining
  const fundsRemaining = Math.round(
    (totalBudgetFunded - paymentInAdvanced - paymentForCompleted) * 100
  ) / 100;

  return {
    project,
    totalBudgetFunded,
    paymentInAdvanced,
    paymentForCompleted,
    fundsRemaining,
    awaitingPaymentCount: advancedPaidMilestones.length,
    paidCount: paidMilestones.length,
  };
}

/**
 * Checks if a milestone is in the "zero paid" category (not yet started).
 */
export function isZeroPaid(milestone: Milestone): boolean {
  return ZERO_PAID_STATES.has(flowMilestoneState(milestone));
}

/**
 * Checks if a milestone is in the "advance paid" category (in progress).
 */
export function isAdvancePaid(milestone: Milestone): boolean {
  return ADVANCED_PAID_STATES.has(flowMilestoneState(milestone));
}

/**
 * Checks if a milestone has been fully paid.
 */
export function isFullyPaid(milestone: Milestone): boolean {
  return FULLY_PAID_STATES.has(flowMilestoneState(milestone));
}

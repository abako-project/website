import { describe, it, expect } from 'vitest';
import { flowProjectState, flowMilestoneState, ProjectState, MilestoneState } from '../flowStates';
import type { Project, Milestone, ScopeSession } from '@/types/index';

// Helper to create a default project to avoid repeating all required fields
const createProject = (overrides: Partial<Project>): Project => ({
  id: 1,
  state: 'deployed',
  milestones: [],
  ...overrides,
} as Project);

// Helper to create a default milestone
const createMilestone = (overrides: Partial<Milestone>): Milestone => ({
  id: 1,
  projectId: 1,
  title: 'Test',
  description: 'Test',
  ...overrides,
} as Milestone);

describe('flowProjectState', () => {
  it('should return CreationError when creationError is defined', () => {
    const project = createProject({ creationError: 'Some error' });
    expect(flowProjectState(project)).toBe(ProjectState.CreationError);
  });

  it('should return ProposalPending when consultantId is undefined', () => {
    // Note: creationError is undefined by default in our mock
    const project = createProject({ consultantId: undefined });
    expect(flowProjectState(project)).toBe(ProjectState.ProposalPending);
  });

  it('should return ProposalRejected when state is rejected_by_coordinator', () => {
    const project = createProject({ consultantId: 2, state: 'rejected_by_coordinator' as any });
    expect(flowProjectState(project)).toBe(ProjectState.ProposalRejected);
  });

  it('should return WaitingForProposalApproval when deployed, no coordinator approval, no scope match, and all milestones have no id', () => {
    const project = createProject({
      consultantId: 2,
      state: 'deployed',
      coordinatorApprovalStatus: undefined,
      milestones: [{ title: 'M1' } as Milestone], // no id
    });
    expect(flowProjectState(project)).toBe(ProjectState.WaitingForProposalApproval);
  });

  it('should return ScopingInProgress when deployed and conditions for WaitingForProposalApproval are not met', () => {
    // Condition not met: milestone has an ID
    const project1 = createProject({
      consultantId: 2,
      state: 'deployed',
      coordinatorApprovalStatus: undefined,
      milestones: [{ id: 10, title: 'M1' } as Milestone],
    });
    expect(flowProjectState(project1)).toBe(ProjectState.ScopingInProgress);

    // Condition not met: coordinatorApprovalStatus is defined
    const project2 = createProject({
      consultantId: 2,
      state: 'deployed',
      coordinatorApprovalStatus: 'approved' as any,
      milestones: [{ title: 'M1' } as Milestone],
    });
    expect(flowProjectState(project2)).toBe(ProjectState.ScopingInProgress);
    
    // Condition not met: scope draft exists for this project
    const project3 = createProject({
      id: 1,
      consultantId: 2,
      state: 'deployed',
      coordinatorApprovalStatus: undefined,
      milestones: [{ title: 'M1' } as Milestone], // no id
    });
    const scope = { projectId: 1 } as ScopeSession;
    expect(flowProjectState(project3, scope)).toBe(ProjectState.ScopingInProgress);
  });

  it('should return ScopeValidationNeeded when state is scope_proposed', () => {
    const project = createProject({ consultantId: 2, state: 'scope_proposed' as any });
    expect(flowProjectState(project)).toBe(ProjectState.ScopeValidationNeeded);
  });

  it('should return ScopeRejected when state is scope_rejected', () => {
    const project = createProject({ consultantId: 2, state: 'scope_rejected' as any });
    expect(flowProjectState(project)).toBe(ProjectState.ScopeRejected);
  });

  it('should return WaitingForTeamAssigment when state is scope_accepted', () => {
    const project = createProject({ consultantId: 2, state: 'scope_accepted' as any });
    expect(flowProjectState(project)).toBe(ProjectState.WaitingForTeamAssigment);
  });

  it('should return ProjectInProgress when state is team_assigned', () => {
    const project = createProject({ consultantId: 2, state: 'team_assigned' as any });
    expect(flowProjectState(project)).toBe(ProjectState.ProjectInProgress);
  });

  it('should return Completed when state is completed', () => {
    const project = createProject({ consultantId: 2, state: 'completed' });
    expect(flowProjectState(project)).toBe(ProjectState.Completed);
  });

  it('should return PaymentReleased when state is payment_released', () => {
    const project = createProject({ consultantId: 2, state: 'payment_released' as any });
    expect(flowProjectState(project)).toBe(ProjectState.PaymentReleased);
  });

  it('should return Invalid for an unknown string state', () => {
    const project = createProject({ consultantId: 2, state: 'unknown_state' as any });
    expect(flowProjectState(project)).toBe(ProjectState.Invalid);
  });
});

describe('flowMilestoneState', () => {
  it('should return CreatingMilestone when state is undefined', () => {
    const milestone = createMilestone({ state: undefined });
    expect(flowMilestoneState(milestone)).toBe(MilestoneState.CreatingMilestone);
  });

  it('should return WaitingDeveloperAssignation when state is pending', () => {
    const milestone = createMilestone({ state: 'pending' });
    expect(flowMilestoneState(milestone)).toBe(MilestoneState.WaitingDeveloperAssignation);
  });

  it('should return MilestoneInProgress when state is task_in_progress', () => {
    const milestone = createMilestone({ state: 'task_in_progress' });
    expect(flowMilestoneState(milestone)).toBe(MilestoneState.MilestoneInProgress);
  });

  it('should return WaitingClientAcceptSubmission when state is in_review', () => {
    const milestone = createMilestone({ state: 'in_review' });
    expect(flowMilestoneState(milestone)).toBe(MilestoneState.WaitingClientAcceptSubmission);
  });

  it('should return MilestoneCompleted when state is completed', () => {
    const milestone = createMilestone({ state: 'completed' });
    expect(flowMilestoneState(milestone)).toBe(MilestoneState.MilestoneCompleted);
  });

  it('should return SubmissionRejectedByClient when state is rejected', () => {
    const milestone = createMilestone({ state: 'rejected' });
    expect(flowMilestoneState(milestone)).toBe(MilestoneState.SubmissionRejectedByClient);
  });

  it('should return Paid when state is paid', () => {
    const milestone = createMilestone({ state: 'paid' as any });
    expect(flowMilestoneState(milestone)).toBe(MilestoneState.Paid);
  });

  it('should return Invalid for an unknown string state', () => {
    const milestone = createMilestone({ state: 'some_other_state' as any });
    expect(flowMilestoneState(milestone)).toBe(MilestoneState.Invalid);
  });
});

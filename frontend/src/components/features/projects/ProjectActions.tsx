/**
 * ProjectActions - Renders action buttons based on project state and user role
 *
 * Handles:
 * - Consultant: approve/reject proposal (WaitingForProposalApproval)
 * - Consultant: submit scope (ScopingInProgress, ScopeRejected)
 * - Client: accept/reject scope (ScopeValidationNeeded)
 * - Client: edit proposal (ProposalRejected)
 * - Consultant: assign team (WaitingForTeamAssigment)
 * - Status messages for other states
 *
 * Mirrors the EJS partials in projects/actions/body/*.ejs.
 */

import { useState, useCallback } from 'react';
import { Button, Input } from '@components/ui';
import { useApproveProposal, useRejectProposal } from '@hooks/useProjects';
import { useAcceptScope, useRejectScope } from '@hooks/useScope';
import {
  flowProjectState,
  ProjectState,
} from '@lib/flowStates';
import type { Project, ScopeSession, User } from '@/types/index';

interface ProjectActionsProps {
  project: Project;
  user: User;
  scope?: ScopeSession;
  /** Called when the scope builder should be shown. */
  onShowScopeBuilder?: () => void;
}

export function ProjectActions({
  project,
  user,
  scope,
  onShowScopeBuilder,
}: ProjectActionsProps) {
  const state = flowProjectState(project, scope);

  const isConsultant =
    !!user.developerId && user.developerId === project.consultantId;
  const isClient =
    !!user.clientId && user.clientId === project.clientId;

  return (
    <div className="space-y-4">
      {/* Consultant: Approve or Reject Proposal */}
      {isConsultant &&
        state === ProjectState.WaitingForProposalApproval && (
          <ConsultantProposalActions projectId={project.id} project={project} />
        )}

      {/* Consultant: Scope in progress - show scope builder link */}
      {isConsultant &&
        (state === ProjectState.ScopingInProgress ||
          state === ProjectState.ScopeRejected) && (
          <ScopingActions
            onShowScopeBuilder={onShowScopeBuilder}
            isScopeRejected={state === ProjectState.ScopeRejected}
          />
        )}

      {/* Consultant: Waiting for team assignment */}
      {isConsultant &&
        state === ProjectState.WaitingForTeamAssigment && (
          <div className="rounded-lg border border-[#3D3D3D] bg-[#231F1F] p-5">
            <p className="text-sm text-[#9B9B9B] mb-3">
              The scope has been accepted. The team needs to be assigned.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#9B9B9B]">
              <i className="ri-information-line text-[#36D399]" />
              <span>Team assignment will be handled by the DAO.</span>
            </div>
          </div>
        )}

      {/* Client: Proposal Rejected - can edit and resubmit */}
      {isClient && state === ProjectState.ProposalRejected && (
        <ProposalRejectedInfo project={project} />
      )}

      {/* Client: Scope Validation Needed - accept or reject */}
      {isClient && state === ProjectState.ScopeValidationNeeded && (
        <ClientScopeResponse project={project} />
      )}

      {/* Client: Proposal Pending */}
      {isClient && state === ProjectState.ProposalPending && (
        <div className="rounded-lg border border-[#3D3D3D] bg-[#231F1F] p-5">
          <div className="flex items-center gap-2 text-sm text-[#9B9B9B]">
            <i className="ri-time-line text-yellow-400" />
            <span>
              Your proposal is pending review. You will be notified once a
              consultant has been assigned.
            </span>
          </div>
        </div>
      )}

      {/* All: Project In Progress */}
      {state === ProjectState.ProjectInProgress && (
        <div className="rounded-lg border border-[#3D3D3D] bg-[#231F1F] p-5">
          <div className="flex items-center gap-2 text-sm text-[#36D399]">
            <i className="ri-play-circle-line" />
            <span>
              Project is in progress. Check milestones below for individual
              task status.
            </span>
          </div>
        </div>
      )}

      {/* All: Completed */}
      {state === ProjectState.Completed && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-5">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <i className="ri-checkbox-circle-line" />
            <span>
              This project has been completed successfully.
            </span>
          </div>
        </div>
      )}

      {/* All: Payment Released */}
      {state === ProjectState.PaymentReleased && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5">
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <i className="ri-money-dollar-circle-line" />
            <span>
              Payment has been released for this project.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Consultant proposal approval/rejection section.
 */
function ConsultantProposalActions({
  projectId,
  project,
}: {
  projectId: string;
  project: Project;
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const approveMutation = useApproveProposal();
  const rejectMutation = useRejectProposal();

  const handleApprove = useCallback(() => {
    approveMutation.mutate(projectId);
  }, [approveMutation, projectId]);

  const handleReject = useCallback(() => {
    if (!rejectionReason.trim()) return;
    rejectMutation.mutate({
      projectId,
      proposalRejectionReason: rejectionReason,
    });
  }, [rejectMutation, projectId, rejectionReason]);

  return (
    <div className="rounded-lg border border-[#3D3D3D] bg-[#231F1F] p-5 space-y-4">
      <h4 className="text-sm font-semibold text-[#F5F5F5]">
        Proposal Review
      </h4>

      <Button
        variant="primary"
        onClick={handleApprove}
        isLoading={approveMutation.isPending}
        disabled={approveMutation.isPending || rejectMutation.isPending}
        className="w-full"
      >
        Approve Proposal
      </Button>

      {!showRejectForm ? (
        <Button
          variant="outline"
          onClick={() => setShowRejectForm(true)}
          className="w-full"
        >
          Reject Proposal
        </Button>
      ) : (
        <div className="space-y-3 border-t border-[#3D3D3D] pt-4">
          <p className="text-sm text-[#9B9B9B]">
            Provide an explanation for the rejection:
          </p>
          <Input
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Type your reason here (required)"
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              isLoading={rejectMutation.isPending}
              disabled={
                !rejectionReason.trim() ||
                approveMutation.isPending ||
                rejectMutation.isPending
              }
              className="flex-1"
            >
              Reject Proposal
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowRejectForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Help section */}
      {project.client?.email && (
        <div className="flex items-start gap-2 border-t border-[#3D3D3D] pt-4">
          <i className="ri-question-line text-[#36D399] mt-0.5" />
          <div className="text-xs text-[#9B9B9B]">
            <p>Have some doubts about the project brief?</p>
            <p className="mt-1">Contact the client to further investigate</p>
            <p className="mt-1 text-[#36D399]">{project.client.email}</p>
          </div>
        </div>
      )}

      {/* Error display */}
      {(approveMutation.error || rejectMutation.error) && (
        <p className="text-sm text-red-400">
          {approveMutation.error?.message ?? rejectMutation.error?.message}
        </p>
      )}
    </div>
  );
}

/**
 * Scoping actions section - shows scope builder trigger.
 */
function ScopingActions({
  onShowScopeBuilder,
  isScopeRejected,
}: {
  onShowScopeBuilder?: () => void;
  isScopeRejected: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#3D3D3D] bg-[#231F1F] p-5 space-y-3">
      {isScopeRejected && (
        <div className="flex items-center gap-2 text-sm text-red-400 mb-2">
          <i className="ri-error-warning-line" />
          <span>
            The client rejected the previous scope. Please revise the milestones
            and submit again.
          </span>
        </div>
      )}
      <p className="text-sm text-[#9B9B9B]">
        {isScopeRejected
          ? 'Update the scope milestones and resubmit for client approval.'
          : 'Define the project scope by creating milestones.'}
      </p>
      {onShowScopeBuilder && (
        <Button variant="primary" onClick={onShowScopeBuilder} className="w-full">
          {isScopeRejected ? 'Revise Scope' : 'Build Scope'}
        </Button>
      )}
    </div>
  );
}

/**
 * Information shown to clients when their proposal was rejected.
 */
function ProposalRejectedInfo({ project }: { project: Project }) {
  const reason =
    project.coordinatorRejectionReason ??
    project.proposalRejectionReason ??
    'No reason provided.';

  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 space-y-3">
      <div className="flex items-center gap-2">
        {project.consultantId && (
          <img
            className="h-6 w-6 rounded-full object-cover"
            src={`/developers/${project.consultantId}/attachment`}
            alt={project.consultant?.name ?? 'Consultant'}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/none.png';
            }}
          />
        )}
        <p className="text-sm text-red-400">
          {project.consultant?.name ?? 'The consultant'} rejected your project
        </p>
      </div>
      <p className="text-sm text-[#9B9B9B]">{reason}</p>

      {project.consultant?.email && (
        <div className="flex items-start gap-2 border-t border-[#3D3D3D] pt-3">
          <i className="ri-question-line text-[#36D399] mt-0.5" />
          <div className="text-xs text-[#9B9B9B]">
            <p>Not sure how to proceed?</p>
            <p className="mt-1">Contact the Project Leader</p>
            <p className="mt-1 text-[#36D399]">{project.consultant.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Client scope response section - accept or reject the proposed scope.
 */
function ClientScopeResponse({ project }: { project: Project }) {
  const [clientResponse, setClientResponse] = useState('');
  const [showConfirm, setShowConfirm] = useState<'accept' | 'reject' | null>(null);

  const acceptMutation = useAcceptScope();
  const rejectMutation = useRejectScope();

  const consultantComment =
    project.comments?.[0]?.consultantComment ?? 'Comments pending';

  const handleAccept = useCallback(() => {
    acceptMutation.mutate({
      projectId: project.id,
      clientResponse,
    });
  }, [acceptMutation, project.id, clientResponse]);

  const handleReject = useCallback(() => {
    rejectMutation.mutate({
      projectId: project.id,
      clientResponse,
    });
  }, [rejectMutation, project.id, clientResponse]);

  return (
    <div className="rounded-lg border border-[#3D3D3D] bg-[#231F1F] p-5 space-y-4">
      <h4 className="text-sm font-semibold text-[#F5F5F5]">
        Scope Review
      </h4>

      {/* Consultant's comment */}
      <div className="border-l-2 border-[#36D399] pl-3">
        <p className="text-xs text-[#9B9B9B] mb-1">Consultant's proposal:</p>
        <p className="text-sm text-[#C0C0C0]">{consultantComment}</p>
      </div>

      {/* Client response input */}
      <Input
        label="Your Response"
        value={clientResponse}
        onChange={(e) => setClientResponse(e.target.value)}
        placeholder="Enter your response"
      />

      {showConfirm === null ? (
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => setShowConfirm('accept')}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            className="flex-1"
          >
            Accept Scope
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowConfirm('reject')}
            disabled={acceptMutation.isPending || rejectMutation.isPending}
            className="flex-1"
          >
            Reject Scope
          </Button>
        </div>
      ) : (
        <div className="space-y-3 border-t border-[#3D3D3D] pt-3">
          <p className="text-sm text-[#9B9B9B]">
            {showConfirm === 'accept'
              ? 'Are you sure you want to accept this scope? The project will proceed to team assignment.'
              : 'Are you sure you want to reject this scope? The consultant will need to revise the milestones.'}
          </p>
          <div className="flex gap-2">
            <Button
              variant={showConfirm === 'accept' ? 'primary' : 'destructive'}
              onClick={showConfirm === 'accept' ? handleAccept : handleReject}
              isLoading={
                showConfirm === 'accept'
                  ? acceptMutation.isPending
                  : rejectMutation.isPending
              }
              className="flex-1"
            >
              {showConfirm === 'accept'
                ? 'Confirm Accept'
                : 'Confirm Reject'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowConfirm(null)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Error display */}
      {(acceptMutation.error || rejectMutation.error) && (
        <p className="text-sm text-red-400">
          {acceptMutation.error?.message ?? rejectMutation.error?.message}
        </p>
      )}
    </div>
  );
}

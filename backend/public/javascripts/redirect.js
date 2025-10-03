// Dashboard

function redirectProjects() {
  location.href = "/projects";
}

function redirectClientProjects(clientId) {
  location.href = "/clients/" + clientId + "projects";
}

function redirectDeveloperProjects(developerId) {
  location.href = "/developers/" + developerId + "/projects";
}

function redirectDeveloperMilestones(developerId) {
  location.href = "/developers/" + developerId + "/milestones";
}

// Project and Proposal:


function redirectProjectShow(projectId) {
  location.href = addTZO("/projects/" + projectId);
}

function redirectProjectEdit(projectId) {
  location.href = addTZO("/projects/" + projectId + "/edit");
}

function redirectProjectNew() {
  location.href = addTZO("/projects/new");
}

function redirectProjectDelete(projectId) {
  location.href = addTZO("/projects/" + projectId + "?_method=DELETE");
}

function redirectProposalSubmit(projectId) {
  location.href = "/projects/" + projectId + "/proposal_submit?_method=PUT";
}

function redirectProposalReject(projectId) {
  location.href = "/projects/" + projectId + "/proposal_reject?_method=PUT";
}

function redirectProposalApprove(projectId) {
  location.href = "/projects/" + projectId + "/proposal_approve?_method=PUT";
}

function redirectSelectProjectConsultant(projectId) {
  location.href = "/projects/" + projectId + "/consultant/select";
}

// Objectives & Constraints:

function redirectObjectivesConstraintsEdit(projectId, objectiveId) {
  location.href = addTZO("/projects/" + projectId + "/objectives_constraints/edit");
}

function redirectObjectiveDelete(projectId, objectiveId) {
  location.href = "/projects/" + projectId + "/objectives/" + objectiveId + "?_method=DELETE";
}

function redirectObjectivesSwapOrder(projectId, objectiveId1, objectiveId2) {
  location.href = "/projects/" + projectId + "/objectives/swaporder/" + objectiveId1 + "/" + objectiveId2 + "?_method=PUT";
}

function redirectConstraintDelete(projectId, constraintId) {
  location.href = "/projects/" + projectId + "/edit/" + constraintId + "?_method=DELETE";
}

function redirectConstraintsSwapOrder(projectId, constraintId1, constraintId2) {
  location.href = "/projects/" + projectId + "/edit/swaporder/" + constraintId1 + "/" + constraintId2 + "?_method=PUT";
}

// Scopes:

function redirectScopeSubmit(projectId) {
  location.href = "/projects/" + projectId + "/scopeSubmit?_method=PUT";
}

function redirectScopeReject(projectId) {
  location.href = "/projects/" + projectId + "/scopeReject?_method=PUT";
}

function redirectScopeAcept(projectId) {
  location.href = "/projects/" + projectId + "/scopeAccept?_method=PUT";
}

// Milestones:

function redirectMilestonesEdit(projectId) {
  location.href = addTZO("/projects/" + projectId + "/milestones/edit");
}

function redirectMilestoneNew(projectId) {
  location.href = addTZO("/projects/" + projectId + "/milestones/new");
}

function redirectMilestoneEdit(projectId, milestoneId) {
  location.href = addTZO("/projects/" + projectId + "/milestones/" + milestoneId + "/edit");
}

function redirectMilestoneDelete(projectId, milestoneId) {
  location.href = "/projects/" + projectId + "/milestones/" + milestoneId + "?_method=DELETE";
}

function redirectMilestonesSwapOrder(projectId, milestoneId1, milestoneId2) {
  location.href = "/projects/" + projectId + "/milestones/swaporder/" + milestoneId1 + "/" + milestoneId2 + "?_method=PUT";
}

function redirectSelectMilestoneDeveloper(projectId, milestoneId) {
  location.href = "/projects/" + projectId + "/milestones/" + milestoneId + "/developer/select";
}

// Escrow

function redirectProjectStart(projectId) {
  location.href = "/projects/" + projectId + "/start";
}

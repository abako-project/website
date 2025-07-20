
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

function redirectProjectSubmit(projectId) {
  location.href = "/projects/" + projectId + "/projectSubmit?_method=PUT";
}

function redirectProjectReject(projectId) {
  location.href = "/projects/" + projectId + "/reject?_method=PUT";
}

function redirectProjectApprove(projectId) {
  location.href = "/projects/" + projectId + "/approve?_method=PUT";
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
  location.href = "/projects/" + projectId + "/constraints/" + constraintId + "?_method=DELETE";
}

function redirectConstraintsSwapOrder(projectId, constraintId1, constraintId2) {
  location.href = "/projects/" + projectId + "/constraints/swaporder/" + constraintId1 + "/" + constraintId2 + "?_method=PUT";
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

// Tasks:

function redirectTasksEdit(projectId) {
  location.href = addTZO("/projects/" + projectId + "/tasks/edit");
}

function redirectTasksSubmit(projectId) {
  location.href = "/projects/" + projectId + "/submitTasks?_method=PUT";
}

function redirectTasksSwapOrder(projectId, taskId1, taskId2) {
  location.href = "/projects/" + projectId + "/tasks/swaporder/" + taskId1 + "/" + taskId2 + "?_method=PUT";
}

function redirectTaskNew(projectId, milestoneId) {
  location.href = addTZO("/projects/" + projectId + "/milestones/" + milestoneId + "/tasks/new");
}

function redirectTaskEdit(projectId, milestoneId, taskId) {
  location.href = addTZO("/projects/" + projectId + "/milestones/" + milestoneId + "/tasks/" + taskId + "/edit");
}

function redirectTaskDelete(projectId, milestoneId, taskId) {
  location.href = "/projects/" + projectId + "/milestones/" + milestoneId + "/tasks/" + taskId + "?_method=DELETE";
}

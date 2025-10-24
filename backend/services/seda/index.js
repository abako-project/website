
/**
 * Módulo principal que agrupa y reexporta las funciones del backend del sistema SEDA.
 *
 * Este archivo permite acceder a todas las operaciones del sistema (clientes, desarrolladores,
 * proyectos, tareas, objetivos, etc.) desde un único punto de entrada.
 *
 * Cada exportación corresponde a una función implementada en un módulo individual
 * dentro del backend.
 */

const sedaError = require("./error");

const sedaProject = require("./project");
const sedaProposal = require("./proposal");
const sedaObjective = require("./objective");
const sedaConstraint = require("./constraint");
const sedaMilestone = require("./milestone");
const sedaMilestoneLog = require("./milestoneLog");
const sedaScope = require("./scope");
const sedaClient = require("./client");
const sedaDeveloper = require("./developer");
const sedaAttachment = require("./attachment");
const sedaLanguage = require("./language");
const sedaRole = require("./role");
const sedaProficiency = require("./proficiency");
const sedaBudget = require("./budget");
const sedaDeliveryTime = require("./deliveryTime");
const sedaProjectType = require("./projectType");
const sedaSkill = require("./skill");
const votations = require("./votations");



exports.projectsIndex = sedaProject.projectsIndex;
exports.project = sedaProject.project;
exports.projectClientId = sedaProject.projectClientId;
exports.projectConsultantId = sedaProject.projectConsultantId;
exports.projectSetState = sedaProject.projectSetState;
exports.proposalSubmit = sedaProject.proposalSubmit;
exports.projectDestroy = sedaProject.projectDestroy;
exports.approveProposal = sedaProject.approveProposal;
exports.rejectProposal = sedaProject.rejectProposal;
exports.projectSetConsultant = sedaProject.projectSetConsultant;

exports.projectStart = sedaProject.projectStart;

exports.proposalCreate = sedaProposal.proposalCreate;
exports.proposalUpdate = sedaProposal.proposalUpdate;

exports.objective = sedaObjective.objective;
exports.objectiveCreate = sedaObjective.objectiveCreate;
exports.objectivesSwapOrder = sedaObjective.objectivesSwapOrder;
exports.objectiveDestroy = sedaObjective.objectiveDestroy;

exports.constraint = sedaConstraint.constraint;
exports.constraintCreate = sedaConstraint.constraintCreate;
exports.constraintsSwapOrder = sedaConstraint.constraintsSwapOrder;
exports.constraintDestroy = sedaConstraint.constraintDestroy;

exports.milestone = sedaMilestone.milestone;
exports.milestoneCreate = sedaMilestone.milestoneCreate;
exports.milestoneUpdate = sedaMilestone.milestoneUpdate;
exports.milestonesSwapOrder = sedaMilestone.milestoneSwapOrder;
exports.milestoneDestroy = sedaMilestone.milestoneDestroy;
exports.milestoneAssignDeveloper = sedaMilestone.milestoneAssignDeveloper;
exports.milestoneDeveloperAccept = sedaMilestone.milestoneDeveloperAccept;
exports.milestoneDeveloperReject = sedaMilestone.milestoneDeveloperReject;
exports.milestoneConsultantSubmit = sedaMilestone.milestoneConsultantSubmit;
exports.milestoneClientAcceptSubmission = sedaMilestone.milestoneClientAcceptSubmission;
exports.milestoneClientRejectSubmission = sedaMilestone.milestoneClientRejectSubmission;
exports.milestoneClientRollbackRejectedSubmission = sedaMilestone.milestoneClientRollbackRejectedSubmission;
exports.milestoneClientAddHistoryComment = sedaMilestone.milestoneClientAddHistoryComment;
exports.milestoneConsultantAddHistoryComment = sedaMilestone.milestoneConsultantAddHistoryComment;

exports.milestoneLogs = sedaMilestoneLog.milestoneLogs;

exports.scopeSubmit = sedaScope.scopeSubmit;
exports.scopeAccept = sedaScope.scopeAccept;
exports.scopeReject = sedaScope.scopeReject;

// exports.task = sedaTask.task;
// exports.taskCreate = sedaTask.taskCreate;
// exports.taskUpdate = sedaTask.taskUpdate;
// exports.tasksSwapOrder = sedaTask.tasksSwapOrder;
// exports.taskDestroy = sedaTask.taskDestroy;
// exports.tasksSubmit = sedaTask.tasksSubmit;

exports.clientIndex = sedaClient.clientIndex;
exports.client = sedaClient.client;
exports.clientCreate = sedaClient.clientCreate;
exports.clientUpdate = sedaClient.clientUpdate;
exports.clientFindByEmail = sedaClient.clientFindByEmail;
exports.clientFindByEmailPassword = sedaClient.clientFindByEmailPassword;
exports.clientAttachment = sedaClient.clientAttachment;

exports.developerIndex = sedaDeveloper.developerIndex;
exports.developer = sedaDeveloper.developer;
exports.developers = sedaDeveloper.developers;
exports.developerCreate = sedaDeveloper.developerCreate;
exports.developerUpdate = sedaDeveloper.developerUpdate;
exports.developerFindByEmail = sedaDeveloper.developerFindByEmail;
exports.developersWithRole = sedaDeveloper.developersWithRole;
exports.developerAttachment = sedaDeveloper.developerAttachment;

exports.attachment = sedaAttachment.attachment;

exports.languageIndex = sedaLanguage.languageIndex;

exports.roleIndex = sedaRole.roleIndex;
exports.role = sedaRole.role;
exports.roleCreate = sedaRole.roleCreate;
exports.roleUpdate = sedaRole.roleUpdate;
exports.roleDestroy = sedaRole.roleDestroy;

exports.proficiencyIndex = sedaProficiency.proficiencyIndex;

exports.budgetIndex = sedaBudget.budgetIndex;

exports.deliveryTimeIndex = sedaDeliveryTime.deliveryTimeIndex;

exports.projectTypeIndex = sedaProjectType.projectTypeIndex;

exports.skillIndex = sedaSkill.skillIndex;

exports.ValidationError = sedaError.ValidationError;

exports.votesCreate = votations.votesCreate;
exports.voteFindOne = votations.voteFindOne;

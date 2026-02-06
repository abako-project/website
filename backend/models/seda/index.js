/**
 * Módulo principal que agrupa y reexporta las funciones del backend del sistema SEDA.
 *
 * Este archivo permite acceder a todas las operaciones del sistema (clientes, desarrolladores,
 * proyectos, milestones, objetivos, etc.) desde un único punto de entrada.
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
const sedaBudget = require("./budget");
const sedaDeliveryTime = require("./deliveryTime");
const sedaProjectType = require("./projectType");
const sedaCalendar = require("./calendar");

module.exports = exports = {
    ...sedaError,
    ...sedaProject,
    ...sedaProposal,
    ...sedaObjective,
    ...sedaConstraint,
    ...sedaMilestone,
    ...sedaMilestoneLog,
    ...sedaScope,
    ...sedaClient,
    ...sedaDeveloper,
    ...sedaBudget,
    ...sedaDeliveryTime,
    ...sedaProjectType,
    ...sedaCalendar
};

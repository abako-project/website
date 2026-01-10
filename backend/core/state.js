

const ProjectState = {

    // El cliente ha enviado la propuesta del proyecto,
    // pero la DAO no la ha asignado un consultor.
    ProposalPending: "ProposalPending",

    // Una vez que la DAO asigna un consultor a una propuesta pendiente, se pasa al estado WaitingForProposalApproval
    // En este estado se espera a que el consultor acepte o rechace la propuesta.
    WaitingForProposalApproval: "WaitingForProposalApproval",

    // El consultor rechaza la propuesta del cliente.
    ProposalRejected: "ProposalRejected", // rechazado por el consultor

    // El consultor aprueba la propuesta del cliente.
  //  ProposalApproved: "ProposalApproved", // aprobado por el consultor

    // El consultor esta creando los milestones
    ScopingInProgress: "ScopingInProgress", // consultor definiendo el scope

    // El consultor publica su scope y ahora espera a que lo valide el cliente
    ScopeValidationNeeded: "ScopeValidationNeeded", // el cliente tiene que validar el milestone

    // El consultor debe solicitar que se asigne el Team de desarrolladores
    WaitingForTeamAssigment: "WaitingForTeamAssigment",

    // El cliente ha aceptado el Scope propuesto por el consultor y ahora tiene que hacer el Escrow.
 //   EscrowFundingNeeded: "EscrowFundingNeeded", // proyecto aprobado pera faltan los fondos del cliente

    // Despues de proporcionar los fondos, el proyecto empieza.
    // Cada uno de los milestones evoluciona con su propio estado.
    // Cada milestone empieza en el estado WaitingDeveloperAssignation esperando a que la DAO le asigne un developer.
    ProjectInProgress: "ProjectInProgress", // Empieza a contar el timepo de desarrollo.

 //   DisputeOpen: "disputeOpen", // por la entrega o el scope
   Completed: "completed", // entregado, aceptado, votado y pagado
 //   Cancelled: "cancelled", // cancelado por el cliente

    //  TeamAssignmentPending: "TeamAssignmentPending", // La DAO/Admin esta asignando el team de desarrolladores

 //   ToBeDone: "ToBeDone",  // Estado que marca algo pendiente de desarrollar


    Invalid: "Invalid"  // Estado invalido o que no existe
};


// Devuelve el estado en el que se encuentra el flujo del proyecto.
// Parametros:
//   project: objeto con los datos del proyecto.
//   sessionScope: El objeto scope que guarda el consultor en req.session para crear el scope.
//                 No pasarlo como parametro cuando no exista.
const flowProjectState = (project, scope) => {

    if (typeof project.consultantId === "undefined") {
        return ProjectState.ProposalPending;
    }

    if (project.state === "rejected_by_coordinator") {
        return ProjectState.ProposalRejected;
    }

    if (project.state === "deployed") {

        if (typeof project.coordinatorApprovalStatus === "undefined") {
            if (typeof scope === "undefined" || scope.projectId != project.id) {
                return ProjectState.WaitingForProposalApproval;
            } else {
                return ProjectState.ScopingInProgress;
            }
        }
    }

    if (project.state === "scope_proposed") {

        // CONTINUAR AQUI

        if (typeof project.proposalRejectionReason !== "undefined") {
            return ProjectState.ToBeDone;
        }

        if (true) {
            return ProjectState.ScopeValidationNeeded;
        }
    }

    if (project.state === "scope_accepted") {
        return ProjectState.WaitingForTeamAssigment;
    }

    if (project.state === "team_assigned") { // Valor de estodo no definitivo
        return ProjectState.ProjectInProgress;
    }

    if (project.state === "completed") { // Valor de estodo no definitivo
        return ProjectState.Completed;
    }

    return ProjectState.Invalid;
};


const MilestoneState = {

    // El consultor esta creando los milestones y aun estan almacenados en req.session.
    CreatingMilestone: "CreatingMilestone",

    // La DAO todavia no ha asignado un developer al milestone.
    // El milestone ya se ha creado, pero el scope aun no ha sido aceptado por el cliente,
    // o ha sido aceptado, pero aun sigue sin developer.
    WaitingDeveloperAssignation: "WaitingDeveloperAssignation",

    // Esperando a que el developer acepte el milestone, o lo rechace
  //  WaitingDeveloperAcceptAssignation: "WaitingDeveloperAcceptAssignation",

    // El desarrollador ha aceptado el milestone y empieza el trabajo.
    MilestoneInProgress: "MilestoneInProgress",

    // El consultor ha enviado el milestone para que lo valide el cliente, y estamos esperando a su valoracion
    WaitingClientAcceptSubmission: "WaitingClientAcceptSubmission",

    // El cliente ha rechazado el trabajo entregado
    SubmissionRejectedByClient: "SubmissionRejectedByClient",

    // El trabajo del milestone se ha completado (y ha sido aceptado por el cliente)
    MilestoneCompleted: "MilestoneCompleted",



    // Ahora hay que pagar al desarrollador.
    AwaitingPayment: "AwaitingPayment",

    // El milestone ya se ha pagado al desarrollador.
    Paid: "Paid",

    Invalid: "Invalid"  // Estado invalido o que no existe
};


// Devuelve el estado en el que se encuentra el flujo del milestone.
// Parametros:
//   milestone: objeto con los datos del milestone.
const flowMilestoneState = (milestone) => {

    if (typeof milestone.state === "undefined") {
        return MilestoneState.CreatingMilestone;
    }

    if (milestone.state === "pending") {
        return MilestoneState.WaitingDeveloperAssignation;
    }

    if (milestone.state === "task_in_progress") {
        return MilestoneState.MilestoneInProgress;
    }

    if (milestone.state === "in_review") {
        return MilestoneState.WaitingClientAcceptSubmission;
    }

    if (milestone.state === "completed") {
        return MilestoneState.MilestoneCompleted;
    }

    if (milestone.state === "rejected") {
        return MilestoneState.SubmissionRejectedByClient;
    }

    if (milestone.state === "ALGO") {
        return MilestoneState.AwaitingPayment;
    }

    if (milestone.state === "ALGO") {
        return MilestoneState.Paid;
    }
    return MilestoneState.Invalid;
};


exports.ProjectState = ProjectState;
exports.MilestoneState = MilestoneState;

exports.flowProjectState = flowProjectState;
exports.flowMilestoneState = flowMilestoneState;

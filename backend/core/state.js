

// Constantes
//
module.exports = exports = {

    VirtoProjectState: {
        Deployed: "deployed",
        Created: "Created",                    // Initial state when project is created
        CoordinatorAssigned: "CoordinatorAssigned",        // Coordinator has been assigned to the project
        TeamAssigned: "TeamAssigned",               // Team members have been assigned
        ScopeProposalInProgress: "ScopeProposalInProgress",    // Coordinator is actively proposing scope revisions
        ScopePendingClientApproval: "ScopePendingClientApproval", // Tasks proposed and awaiting client approval
        ScopeAccepted: "ScopeAccepted",              // Client has accepted the scope and made advance payment
        Completed: "Completed",                  // All tasks are completed and project is finalized
    },

    ProjectState: {

        // Hasta que el cliente no envioa la propuesta, es estado es undefined o null.
    //Creating: "creating" , // creando el proyecto

    // El cliente ha enviado la propuesta del proyecto,
    // pero la DAO no la ha asignado un consultor.
    ProposalPending: "ProposalPending",

    // Una vez que la DAO asigna un consultor a una propuesta pendiente, se pasa al estado WaitingForProposalApproval
      // En este estado se espera a que el consultor acepte o rechace la propuesta.
    WaitingForProposalApproval: "WaitingForProposalApproval",

    // El consultor rechaza la propuesta del cliente.
    ProposalRejected: "ProposalRejected", // rechazado por el consultor

    // El consultor aprueba la propuesta del cliente.
    ProposalApproved: "ProposalApproved", // aprobado por el consultor

    // El consultor esta creando los milestones
    ScopingInProgress: "ScopingInProgress", // consultor definiendo el scope

    // El consultor publica su scope y ahora espera a que lo valide el cliente
    ScopeValidationNeeded: "ScopeValidationNeeded", // el cliente tiene que validar el milestone

    // El cliente ha aceptado el Scope propuesto por el consultor y ahora tiene que hacer el Escrow.
    EscrowFundingNeeded: "EscrowFundingNeeded", // proyecto aprobado pera faltan los fondos del cliente

      // Despues de proporcionar los fondos, el proyecto empieza.
      // Cada uno de los milestones evoluciona con su propio estado.
      // Cada milestone empieza en el estado WaitingDeveloperAssignation esperando a que la DAO le asigne un developer.
    ProjectInProgress: "ProjectInProgress", // Empieza a contar el timepo de desarrollo.

    DisputeOpen: "disputeOpen", // por la entrega o el scope
    Completed: "completed", // entregado, validado y pagado
    Cancelled: "cancelled", // cancelado por el cliente

     //  TeamAssignmentPending: "TeamAssignmentPending", // La DAO/Admin esta asignando el team de desarrolladores

  },

    MilestoneState: {

        // La DAO todavia no ha asignado un developer al milestone.
        WaitingDeveloperAssignation: "WaitingDeveloperAssignation",

        // Esperando a que el developer acepte el milestone, o lo rechace
        WaitingDeveloperAcceptAssignation: "WaitingDeveloperAcceptAssignation",

        // El desarrollador ha aceptado el milestone y empieza el trabajo.
        MilestoneInProgress: "MilestoneInProgress",

        // El consultor ha enviado el milestone para que lo valide el cliente, y estamos esperando a su valoracion
        WaitingClientAcceptSubmission: "WaitingClientAcceptSubmission",

        // El cliente ha rechazado el trabajo entregado
        SubmissionRejectedByClient: "SubmissionRejectedByClient",

        // El trabajo del milestone se ha completado (y ha sido aceptado por el cliente)
        // Ahora hay que pagar al desarrollador.
        AwaitingPayment: "AwaitingPayment",

        // El milestone ya se ha pagado al desarrollador.
        Paid: "Paid",
    }
}










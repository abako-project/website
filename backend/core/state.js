

// Constantes
//
// Usar null cuando aun no lo ha publicado el cliente.
module.exports = exports = {
  ProjectState: {

    // Hasta que el cliente no envioa la propuesta, es estado es undefined o null.
    //Creating: "creating" , // creando el proyecto

    // El cliente ha enviado la propuesta del proyecto,
    // pero la DAO no la ha asignado un consultor.
    ProposalPending: "ProposalPending",

    // Una vez que la DAO asigna un consultor, se pasa al estado
    // ProposalAccepted. En este estado se espera a que el consultor acepte o rechace la propuesta.
    ProposalAccepted: "ProposalAccepted",

    // El consultor rechaza la propuesta del cliente.
    ProposalRejected: "ProposalRejected", // rechazado por el consultor

    // El consultor aprueba la propuesta del cliente.
    ProposalApproved: "ProposalApproved", // aprobado por el consultor

    // El consultor esta creando los milestones
    ScopingInProgress: "ScopingInProgress", // consultor definiendo el scope

    // El consultor publica su scope y ahora espera a que lo valide el cliente
    ScopeValidationNeeded: "ScopeValidationNeeded", // el cliente tiene que validar el milestone

    // El cliente ha aceptado el Scope propuesto por el consultor y ahora tiene que hacer el Escrow.
    EscrowFundingNeeded: "EscrowFundingNeeded", // proyecto aprovado pera faltan los fondos del cliente

    TeamAssignmentPending: "TeamAssignmentPending", // La DAO/Admin esta asignando el team de desarrolladores

    InProgress: "inProgress", // trabajando
    DisputeOpen: "disputeOpen", // por la entrega o el scope
    Completed: "completed", // entregado, validado y pagado
    Cancelled: "cancelled", // cancelado por el cliente

  }
}










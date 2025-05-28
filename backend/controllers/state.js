

// Constantes
//
// Usar null cuando aun no lo ha publicado el cliente.
module.exports = exports = {
  ProjectState: {
    //Creating: "creating" , // creando el proyecto
    Pending: "pending",   // aun no ha sido aceptado por la DAO
    Rejected: "rejected", // rechazado por la DAO
    Approved: "approved", // aprobado por la DAO
    ScopingInProgress: "scopingInProgress", // consultor definiendo el scope
    ValidationNeeded: "validationNeeded", // el cliente tiene que validar el milestone

    TaskingInProgress: "taskingInProgress", // creando tasks

    TeamAssignmentPending: "teamAssignmentPending", // se esta asignado el team de desarrolladores
    InProgress: "inProgress", // trabajando
    DisputeOpen: "disputeOpen", // por la entrega o el scope
    Completed: "completed", // entregado, validado y pagado
    Cancelled: "cancelled", // cancelado por el cliente
    EscrowFundingNeeded: "escrowFundingNeeded", // proyecto aprovado pera faltan los fondos del cliente

  }
}










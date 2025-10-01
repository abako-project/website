
/**
 * Convierte un objeto Attachment en un objeto JSON simplificado.
 *
 * @function attachmentJson
 * @param {Object} attachment - Instancia del modelo Attachment.
 * @returns {Object|undefined} Objeto JSON con los datos del attachment o `undefined` si no existe.
 */
const attachmentJson = attachment => {
  if (!attachment) return undefined;
  return {
    id: attachment.id,
    mime: attachment.mime,
    image: attachment.image
  };
};

/**
 * Convierte un objeto User en un objeto JSON, incluyendo cliente y desarrollador si están asociados.
 *
 * @function userJson
 * @param {Object} user - Instancia del modelo User.
 * @returns {Object|undefined} Objeto JSON del usuario o `undefined` si no existe.
 */
const userJson = user => {
  if (!user) return undefined;
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.valueOf(),
    updatedAt: user.updatedAt.valueOf(),

    client: clientJson(user.client),
    developer: developerJson(user.developer)
  };
};


/**
 * Convierte un objeto Project en un objeto JSON completo,
 * incluyendo cliente, consultor, objetivos, restricciones, hitos, comentarios, presupuesto,
 * tipo de hora de entrega, tipo de proyecto, ....
 *
 * @function projectJson
 * @param {Object} project - Instancia del modelo Project.
 * @returns {Object|undefined} Objeto JSON del proyecto o `undefined` si no existe.
 */
const projectJson = project => {
  if (!project) return undefined;
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    summary: project.summary,
    projectTypeId: project.projectTypeId,
    state: project.state,
    url: project.url,
    budgetId: project.budgetId,
    deliveryTimeId: project.deliveryTimeId,
    deliveryDate: project.deliveryDate.valueOf(),
    clientId: project.clientId,
    consultantId: project.consultantId,
    createdAt: project.createdAt.valueOf(),
    updatedAt: project.updatedAt.valueOf(),

    client: clientJson(project.client),
    consultant: developerJson(project.consultant),
    objectives: project.objectives?.map(objective => objectiveJson(objective)) || [],
    constraints: project.constraints?.map(constraint => constraintJson(constraint)) || [],
    milestones: project.milestones?.map(milestone => milestoneJson(milestone)) || [],
    comments: project.comments?.map(comment => commentJson(comment)) || [],
    budget: budgetJson(project.budget),
    deliveryTime: deliveryTimeJson(project.deliveryTime),
    projectType: projectTypeJson(project.projectType),
  };
};

/**
 * Convierte un objeto Client en un objeto JSON, incluyendo usuario y proyectos asociados.
 *
 * @function clientJson
 * @param {Object} client - Instancia del modelo Client.
 * @returns {Object|undefined} Objeto JSON del cliente o `undefined` si no existe.
 */
const clientJson = client => {
  if (!client) return undefined;
  return {
    id: client.id,
    name: client.name,
    company: client.company,
    department: client.department,
    website: client.website,
    description: client.description,
    location: client.location,
    userId: client.userId,
    createdAt: client.createdAt.valueOf(),
    updatedAt: client.updatedAt.valueOf(),

    user: userJson(client.user),
    languages: client.languages?.map(language => languageJson(language)) || [],
    projects: client.projects?.map(project => projectJson(project)) || [],
  };
};

/**
 * Convierte un objeto Developer en un objeto JSON detallado,
 * incluyendo relaciones como usuario, lenguajes, rol, habilidades, proyectos y asignaciones.
 *
 * @function developerJson
 * @param {Object} developer - Instancia del modelo Developer.
 * @returns {Object|undefined} Objeto JSON del desarrollador o `undefined` si no existe.
 */
const developerJson = developer => {
  if (!developer) return undefined;
  return {
    id: developer.id,
    name: developer.name,
    address: developer.address,
    bio: developer.bio,
    background: developer.background,
    experienceLevel: developer.experienceLevel,
    githubUsername: developer.githubUsername,
    portfolioUrl: developer.portfolioUrl,
    location: developer.location,
    availability: developer.availability,
    userId: developer.userId,
    roleId: developer.roleId,
    createdAt: developer.createdAt.valueOf(),
    updatedAt: developer.updatedAt.valueOf(),

    user: userJson(developer.user),
    languages: developer.languages?.map(language => languageJson(language)) || [],
    role: roleJson(developer.role),
    skills: developer.skills?.map(skill => skillJson(skill)) || [],
    consultantProjects: developer.consultantProjects?.map(project => projectJson(project)) || [],
    assignations: developer.assignations?.map(assignation => assignationJson(assignation)) || [],
  };
};

/**
 * Convierte un objeto Language en un objeto JSON.
 *
 * @function languageJson
 * @param {Object} language - Instancia del modelo Language.
 * @returns {Object|undefined} Objeto JSON del lenguaje o `undefined`.
 */
const languageJson = language => {
  if (!language) return undefined;
  return {
    id: language.id,
    code: language.code,
    name: language.name,
    createdAt: language.createdAt.valueOf(),
    updatedAt: language.updatedAt.valueOf()
  };
};

/**
 * Convierte un objeto Objective en un objeto JSON.
 *
 * @function objectiveJson
 * @param {Object} objective - Instancia del modelo Objective.
 * @returns {Object|undefined} Objeto JSON del objetivo o `undefined`.
 */
const objectiveJson = objective => {
  if (!objective) return undefined;
  return {
    id: objective.id,
    description: objective.description,
    displayOrder: objective.displayOrder,
    projectId: objective.projectId,
    createdAt: objective.createdAt.valueOf(),
    updatedAt: objective.updatedAt.valueOf()
  };
};

/**
 * Convierte un objeto Constraint en un objeto JSON.
 *
 * @function constraintJson
 * @param {Object} constraint - Instancia del modelo Constraint.
 * @returns {Object|undefined} Objeto JSON de la restricción o `undefined`.
 */
const constraintJson = constraint => {
  if (!constraint) return undefined;
  return {
    id: constraint.id,
    description: constraint.description,
    displayOrder: constraint.displayOrder,
    projectId: constraint.projectId,
    createdAt: constraint.createdAt.valueOf(),
    updatedAt: constraint.updatedAt.valueOf()
  };
};

/**
 * Convierte un objeto Role en un objeto JSON, incluyendo los desarrolladores que lo usan.
 *
 * @function roleJson
 * @param {Object} role - Instancia del modelo Role.
 * @returns {Object|undefined} Objeto JSON del rol o `undefined`.
 */
const roleJson = role => {
  if (!role) return undefined;
  return {
    id: role.id,
    name: role.name,
    createdAt: role.createdAt.valueOf(),
    updatedAt: role.updatedAt.valueOf(),

    developers: role.developers?.map(developer => developerJson(developer)) || [],
  };
};

/**
 * Convierte un objeto Budget en un objeto JSON.
 *
 * @function budgetJson
 * @param {Object} budget - Instancia del modelo Budget.
 * @returns {Object|undefined} Objeto JSON del budget o `undefined`.
 */
const budgetJson = budget => {
  if (!budget) return undefined;
  return {
    id: budget.id,
    description: budget.description,
    createdAt: budget.createdAt.valueOf(),
    updatedAt: budget.updatedAt.valueOf(),
  };
};

/**
 * Convierte un objeto DeliveryTime en un objeto JSON.
 *
 * @function deliveryTimeJson
 * @param {Object} deliveryTime - Instancia del modelo DeliveryTime.
 * @returns {Object|undefined} Objeto JSON del DeliveryTime o `undefined`.
 */
const deliveryTimeJson = deliveryTime => {
  if (!deliveryTime) return undefined;
  return {
    id: deliveryTime.id,
    description: deliveryTime.description,
    createdAt: deliveryTime.createdAt.valueOf(),
    updatedAt: deliveryTime.updatedAt.valueOf(),
  };
};

/**
 * Convierte un objeto ProjectType en un objeto JSON.
 *
 * @function projectTypeJson
 * @param {Object} projectType - Instancia del modelo ProjectType.
 * @returns {Object|undefined} Objeto JSON del ProjectType o `undefined`.
 */
const projectTypeJson = projectType => {
  if (!projectType) return undefined;
  return {
    id: projectType.id,
    description: projectType.description,
    createdAt: projectType.createdAt.valueOf(),
    updatedAt: projectType.updatedAt.valueOf(),
  };
};

/**
 * Convierte un objeto Milestone en un objeto JSON, incluyendo sus tareas.
 *
 * @function milestoneJson
 * @param {Object} milestone - Instancia del modelo Milestone.
 * @returns {Object|undefined} Objeto JSON del milestone o `undefined`.
 */
const milestoneJson = milestone => {
  if (!milestone) return undefined;
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    budget: milestone.budget,
    deliveryTimeId: milestone.deliveryTimeId,
    deliveryDate: milestone.deliveryDate.valueOf(),
    displayOrder: milestone.displayOrder,
    projectId: milestone.projectId,
    createdAt: milestone.createdAt.valueOf(),
    updatedAt: milestone.updatedAt.valueOf(),

    assignation: assignationJson(milestone.assignation),
    deliveryTime: deliveryTimeJson(milestone.deliveryTime),

  };
};

/**
 * Convierte un objeto Skill en un objeto JSON.
 *
 * @function skillJson
 * @param {Object} skill - Instancia del modelo Skill.
 * @returns {Object|undefined} Objeto JSON de la habilidad o `undefined`.
 */
const skillJson = skill => {
  if (!skill) return undefined;
  return {
    id: skill.id,
    name: skill.name,
    createdAt: skill.createdAt.valueOf(),
    updatedAt: skill.updatedAt.valueOf()
  };
};

/**
 * Convierte un objeto Task en un objeto JSON, incluyendo rol y asignación.
 *
 * @function taskJson
 * @param {Object} task - Instancia del modelo Task.
 * @returns {Object|undefined} Objeto JSON de la tarea o `undefined`.
 */
// const taskJson = task => {
//   if (!task) return undefined;
//   return {
//     id: task.id,
//     title: task.title,
//     description: task.description,
//     budget: task.budget,
//     currency: task.currency,
//     deliveryDate: task.deliveryDate.valueOf(),
//     displayOrder: task.displayOrder,
//     milestoneId: task.milestoneId,
//     roleId: task.roleId,
//     createdAt: task.createdAt.valueOf(),
//     updatedAt: task.updatedAt.valueOf(),
//
//     role: roleJson(task.role),
//     assignation: assignationJson(task.assignation),
//   };
// };

/**
 * Convierte un objeto Comment en un objeto JSON.
 *
 * @function commentJson
 * @param {Object} comment - Instancia del modelo Comment.
 * @returns {Object|undefined} Objeto JSON del comentario o `undefined`.
 */
const commentJson = comment => {
  if (!comment) return undefined;
  return {
    id: comment.id,
    consultantComment: comment.consultantComment,
    clientResponse: comment.clientResponse,
    projectId: comment.projectId,
    createdAt: comment.createdAt.valueOf(),
    updatedAt: comment.updatedAt.valueOf()
  };
};

/**
 * Convierte un objeto Assignation en un objeto JSON, incluyendo el desarrollador asignado.
 *
 * @function assignationJson
 * @param {Object} assignation - Instancia del modelo Assignation.
 * @returns {Object|undefined} Objeto JSON de la asignación o `undefined`.
 */
const assignationJson = assignation => {
  if (!assignation) return undefined;
  return {
    id: assignation.id,
    comment: assignation.comment,
    state: assignation.state,
    developerId: assignation.developerId,
    milestoneId: assignation.milestoneId,
    createdAt: assignation.createdAt.valueOf(),
    updatedAt: assignation.updatedAt.valueOf(),

    developer: developerJson(assignation.developer),
  };
};


exports.attachmentJson = attachmentJson;
exports.userJson = userJson;
exports.projectJson = projectJson;
exports.clientJson = clientJson;
exports.developerJson = developerJson;
exports.languageJson = languageJson;
exports.objectiveJson = objectiveJson;
exports.constraintJson = constraintJson;
exports.roleJson = roleJson;
exports.budgetJson = budgetJson;
exports.deliveryTimeJson = deliveryTimeJson;
exports.projectTypeJson = projectTypeJson;
exports.milestoneJson = milestoneJson;
exports.skillJson = skillJson;
exports.commentJson = commentJson;
exports.assignationJson = assignationJson;

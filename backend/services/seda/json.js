

const attachmentJson = attachment => {
  if (!attachment) return undefined;
  return {
    id: attachment.id,
    mime: attachment.mime,
    image: attachment.image
  };
};


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


const projectJson = project => {
  if (!project) return undefined;
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    summary: project.summary,
    state: project.state,
    url: project.url,
    budget: project.budget,
    currency: project.currency,
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
  };
};


const clientJson = client => {
  if (!client) return undefined;
  return {
    id: client.id,
    name: client.name,
    company: client.company,
    department: client.department,
    website: client.website,
    description: client.description,
    city: client.city,
    country: client.country,
    userId: client.userId,
    createdAt: client.createdAt.valueOf(),
    updatedAt: client.updatedAt.valueOf(),

    user: userJson(client.user),
  //  attachment: attachmentJson(client.attachment),
    projects: client.projects?.map(project => projectJson(project)) || [],
  };
};


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
    city: developer.city,
    country: developer.country,
    availability: developer.availability,
    userId: developer.userId,
    roleId: developer.roleId,
    createdAt: developer.createdAt.valueOf(),
    updatedAt: developer.updatedAt.valueOf(),

    user: userJson(developer.user),
    // attachment: attachmentJson(developer.attachment),
    languages: developer.languages?.map(language => languageJson(language)) || [],
    role: roleJson(developer.role),
    skills: developer.skills?.map(skill => skillJson(skill)) || [],
    consultantProjects: developer.consultantProjects?.map(project => projectJson(project)) || [],
    assignations: developer.assignations?.map(assignation => assignationJson(assignation)) || [],
  };
};


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


const milestoneJson = milestone => {
  if (!milestone) return undefined;
  return {
    id: milestone.id,
    title: milestone.title,
    description: milestone.description,
    budget: milestone.budget,
    currency: milestone.currency,
    deliveryDate: milestone.deliveryDate.valueOf(),
    displayOrder: milestone.displayOrder,
    projectId: milestone.projectId,
    createdAt: milestone.createdAt.valueOf(),
    updatedAt: milestone.updatedAt.valueOf(),

    tasks: milestone.tasks?.map(task => taskJson(task)) || [],
  };
};


const skillJson = skill => {
  if (!skill) return undefined;
  return {
    id: skill.id,
    name: skill.name,
    createdAt: skill.createdAt.valueOf(),
    updatedAt: skill.updatedAt.valueOf()
  };
};


const taskJson = task => {
  if (!task) return undefined;
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    budget: task.budget,
    currency: task.currency,
    deliveryDate: task.deliveryDate.valueOf(),
    displayOrder: task.displayOrder,
    milestoneId: task.milestoneId,
    roleId: task.roleId,
    createdAt: task.createdAt.valueOf(),
    updatedAt: task.updatedAt.valueOf(),

    role: roleJson(task.role),
    assignation: assignationJson(task.assignation),
  };
};


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


const assignationJson = assignation => {
  if (!assignation) return undefined;
  return {
    id: assignation.id,
    comment: assignation.comment,
    state: assignation.state,
    developerId: assignation.developerId,
    taskId: assignation.taskId,
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
exports.milestoneJson = milestoneJson;
exports.skillJson = skillJson;
exports.taskJson = taskJson;
exports.commentJson = commentJson;
exports.assignationJson = assignationJson;

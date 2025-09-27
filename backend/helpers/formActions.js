
exports.proposalCreateActionForm = () => "/projects";

exports.proposalUpdateActionForm = projectId => "/projects/" + projectId + "?_method=PUT";

exports.objectiveCreateActionForm = projectId => "/projects/" + projectId + "/objectives";

exports.constraintCreateActionForm = projectId => "/projects/" + projectId + "/edit";

exports.scopeSubmitActionForm = projectId => "/projects/" + projectId + "/scopeSubmit?_method=PUT";

exports.milestoneCreateActionForm = projectId => "/projects/" + projectId + "/milestones";

exports.milestoneUpdateActionForm = (projectId, milestoneId) => "/projects/" + projectId + "/milestones/" + milestoneId + "?_method=PUT";

exports.taskCreateActionForm = (projectId, milestoneId) => "/projects/" + projectId + "/milestones/" + milestoneId + "/tasks";

exports.taskUpdateActionForm = (projectId, milestoneId, taskId) => "/projects/" + projectId + "/milestones/" + milestoneId + "/tasks" + taskId + "?_method=PUT";

exports.rolesCreateActionForm = () => "/roles/create";

exports.roleUpdateActionForm = roleId => "/roles/" + roleId + "?_method=PUT";

exports.consultantSelectActionForm = projectId => "/projects/" + projectId + "/consultant";

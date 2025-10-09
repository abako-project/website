'use strict';

const Sequelize = require('sequelize');

const config = require(__dirname + '/../config/config.json').development;
const sequelize = new Sequelize(config);

const Session = require('./session')(sequelize);

const User = require('./user')(sequelize);
const Attachment = require('./attachment')(sequelize);
const Client = require('./client')(sequelize);
const Developer = require('./developer')(sequelize);
const Language = require('./language')(sequelize);
const Role = require('./role')(sequelize);
const Proficiency = require('./proficiency')(sequelize);
const Skill = require('./skill')(sequelize);
const Budget = require('./budget')(sequelize);
const DeliveryTime = require('./deliveryTime')(sequelize);
const ProjectType = require('./projectType')(sequelize);

const Project = require('./project')(sequelize);
const Objective = require('./objective')(sequelize);
const Constraint = require('./constraint')(sequelize);
const Milestone = require('./milestone')(sequelize);

const Comment = require('./comment')(sequelize);

const Assignation = require('./assignation')(sequelize);


User.hasOne(Client, {as: 'client', foreignKey: 'userId'});
Client.belongsTo(User, {as: 'user', foreignKey: 'userId'});

User.hasOne(Developer, {as: 'developer', foreignKey: 'userId'});
Developer.belongsTo(User, {as: 'user', foreignKey: 'userId'});

// Relation 1-to-1 between User and Attachment
Attachment.hasOne(Client, {as: 'client', foreignKey: 'attachmentId'});
Client.belongsTo(Attachment, {as: 'attachment', foreignKey: 'attachmentId'});

// Relation 1-to-1 between developer and Attachment
Attachment.hasOne(Developer, {as: 'developer', foreignKey: 'attachmentId'});
Developer.belongsTo(Attachment, {as: 'attachment', foreignKey: 'attachmentId'});

// Relation N-to-N between client and Language
Client.belongsToMany(Language, {as: 'languages', through: "ClientKnownLanguages",
  foreignKey: 'clientId', otherKey: 'languageId'});
Language.belongsToMany(Client, {as: 'clients', through: "ClientKnownLanguages",
  foreignKey: 'languageId', otherKey: 'clientId'});

// Relation N-to-N between developer and Language
Developer.belongsToMany(Language, {as: 'languages', through: "DeveloperKnownLanguages",
  foreignKey: 'developerId', otherKey: 'languageId'});
Language.belongsToMany(Developer, {as: 'developers', through: "DeveloperKnownLanguages",
  foreignKey: 'languageId', otherKey: 'developerId'});

// Relation 1-to-1 between developer and role
Role.hasMany(Developer, {as: 'developers', foreignKey: 'roleId'});
Developer.belongsTo(Role, {as: 'role', foreignKey: 'roleId'});

// Relation 1-to-1 between developer and proficiency
Proficiency.hasMany(Developer, {as: 'developers', foreignKey: 'proficiencyId'});
Developer.belongsTo(Proficiency, {as: 'proficiency', foreignKey: 'proficiencyId'});

// Relation 1-to-N between developer and skill
Developer.belongsToMany(Skill, {as: 'skills', through: "DeveloperSkills",
  foreignKey: 'developerId', otherKey: 'skillId'});
Skill.belongsToMany(Developer, {as: 'developers', through: "DeveloperSkills",
  foreignKey: 'skillId', otherKey: 'developerId'});

// Relation 1-to-N between milestone and skill
Milestone.belongsToMany(Skill, {as: 'skills', through: "MilestoneSkills",
  foreignKey: 'milestoneId', otherKey: 'skillId'});
Skill.belongsToMany(Milestone, {as: 'milestones', through: "MilestoneSkills",
  foreignKey: 'skillId', otherKey: 'milestoneId'});

// Relation 1-to-N between Client and Projects:
Client.hasMany(Project, {as: 'projects', foreignKey: 'clientId'});
Project.belongsTo(Client, {as: 'client', foreignKey: 'clientId'});

// Relation 1-to-N between Developer(as consultant) and Projects:
Developer.hasMany(Project, {as: 'consultantProjects', foreignKey: 'consultantId'});
Project.belongsTo(Developer, {as: 'consultant', foreignKey: 'consultantId'});

// Relation 1-to-N between Project and ProjectObjective:
Project.hasMany(Objective, {as: 'objectives', foreignKey: 'projectId'});
Objective.belongsTo(Project, {as: 'project', foreignKey: 'projectId'});

// Relation 1-to-N between Project and ProjectConstraint:
Project.hasMany(Constraint, {as: 'constraints', foreignKey: 'projectId'});
Constraint.belongsTo(Project, {as: 'project', foreignKey: 'projectId'});

// Relation 1-to-N between Project and Milestone:
Project.hasMany(Milestone, {as: 'milestones', foreignKey: 'projectId'});
Milestone.belongsTo(Project, {as: 'project', foreignKey: 'projectId'});

// Relation 1-to-N between Budget and Project
Budget.hasMany(Project, {as: 'projects', foreignKey: 'budgetId'});
Project.belongsTo(Budget, {as: 'budget', foreignKey: 'budgetId'});

// Relation 1-to-N between DeliveryTime and Project
DeliveryTime.hasMany(Project, {as: 'projects', foreignKey: 'deliveryTimeId'});
Project.belongsTo(DeliveryTime, {as: 'deliveryTime', foreignKey: 'deliveryTimeId'});

// Relation 1-to-N between DeliveryTime and Milestone
DeliveryTime.hasMany(Milestone, {as: 'milestones', foreignKey: 'deliveryTimeId'});
Milestone.belongsTo(DeliveryTime, {as: 'deliveryTime', foreignKey: 'deliveryTimeId'});

// Relation N-to-1 between milestone and role
Role.hasMany(Milestone, {as: 'milestones', foreignKey: 'roleId'});
Milestone.belongsTo(Role, {as: 'role', foreignKey: 'roleId'});

// Relation N-to-1 between milestone and proficiency
Proficiency.hasMany(Milestone, {as: 'milestones', foreignKey: 'proficiencyId'});
Milestone.belongsTo(Proficiency, {as: 'proficiency', foreignKey: 'proficiencyId'});

// Relation 1-to-N between ProjectType and Project
ProjectType.hasMany(Project, {as: 'projects', foreignKey: 'projectTypeId'});
Project.belongsTo(ProjectType, {as: 'projectType', foreignKey: 'projectTypeId'});

// Relation 1-to-N between Project and Comment
Project.hasMany(Comment, {as: 'comments', foreignKey: 'projectId'});
Comment.belongsTo(Project, {as: 'project', foreignKey: 'projectId'});

// Relation 1-to-1 between Assignation and Milestone
Milestone.hasOne(Assignation, {as: 'assignation', foreignKey: 'milestoneId'});
Assignation.belongsTo(Milestone, {as: 'milestone', foreignKey: 'milestoneId'});

// Relation 1-to-N between Developer and Assignation
Developer.hasMany(Assignation, {as: 'assignations', foreignKey: 'developerId'});
Assignation.belongsTo(Developer, {as: 'developer', foreignKey: 'developerId'});


module.exports = sequelize;

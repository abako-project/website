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
const Skill = require('./skill')(sequelize);

const Project = require('./project')(sequelize);
const Objective = require('./objective')(sequelize);
const Constraint = require('./constraint')(sequelize);
const Milestone = require('./milestone')(sequelize);
const Task = require('./task')(sequelize);

User.hasOne(Client, {as: 'client', foreignKey: 'userId'});
Client.belongsTo(User, {as: 'user', foreignKey: 'userId'});

User.hasOne(Developer, {as: 'developer', foreignKey: 'userId'});
Developer.belongsTo(User, {as: 'user', foreignKey: 'userId'});

// Relation 1-to-1 between Client and Attachment
Client.hasOne(Attachment, {as: 'attachment', foreignKey: 'clientId'});
Attachment.belongsTo(Client, {as: 'client', foreignKey: 'clientId'});

// Relation 1-to-1 between developer and Attachment
Developer.hasOne(Attachment, {as: 'attachment', foreignKey: 'developerId'});
Attachment.belongsTo(Developer, {as: 'developer', foreignKey: 'developerId'});

// Relation N-to-N between developer and Language
Developer.belongsToMany(Language, {as: 'languages', through: "KnownLanguages",
  foreignKey: 'developerId', otherKey: 'languageId'});
Language.belongsToMany(Developer, {as: 'developers', through: "KnownLanguages",
  foreignKey: 'languageId', otherKey: 'developerId'});

// Relation 1-to-1 between developer and role
Role.hasMany(Developer, {as: 'developers', foreignKey: 'roleId'});
Developer.belongsTo(Role, {as: 'role', foreignKey: 'roleId'});

// Relation 1-to-N between developer and skill
Developer.belongsToMany(Skill, {as: 'skills', through: "DeveloperSkills",
  foreignKey: 'developerId', otherKey: 'skillId'});
Skill.belongsToMany(Developer, {as: 'developers', through: "DeveloperSkills",
  foreignKey: 'skillId', otherKey: 'developerId'});

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

// Relation 1-to-N between Milestone and Tasks
Milestone.hasMany(Task, {as: 'tasks', foreignKey: 'milestoneId'});
Task.belongsTo(Milestone, {as: 'milestone', foreignKey: 'milestoneId'});

// Relation 1-to-N between Role and Tasks
Role.hasMany(Task, {as: 'tasks', foreignKey: 'roleId'});
Task.belongsTo(Role, {as: 'role', foreignKey: 'roleId'});

module.exports = sequelize;

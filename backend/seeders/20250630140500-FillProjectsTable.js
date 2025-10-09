'use strict';

const states = require("../core/state");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    const Client = require("../models/client")(sequelize);
    const Developer = require("../models/developer")(sequelize);
    const Project = require("../models/project")(sequelize);
    const Objective = require("../models/objective")(sequelize);
    const Constraint = require("../models/constraint")(sequelize);
    const Milestone = require("../models/milestone")(sequelize);
    const Role = require("../models/role")(sequelize);
    const Proficiency = require('../models/proficiency')(sequelize);
    const Budget = require("../models/budget")(sequelize);
    const DeliveryTime = require('../models/deliveryTime')(sequelize);
      const ProjectType = require('../models/projectType')(sequelize);
      const Assignation = require('../models/assignation')(sequelize);

    const states = require("../core/state");

    // Relation 1-to-N between Project and Objective:
    Project.hasMany(Objective, {as: 'objectives', foreignKey: 'projectId'});
    Objective.belongsTo(Project, {as: 'project', foreignKey: 'projectId'});

    // Relation 1-to-N between Project and Constraint:
    Project.hasMany(Constraint, {as: 'constraints', foreignKey: 'projectId'});
    Constraint.belongsTo(Project, {as: 'project', foreignKey: 'projectId'});

    // Relation 1-to-N between Project and Milestone:
    Project.hasMany(Milestone, {as: 'milestones', foreignKey: 'projectId'});
    Milestone.belongsTo(Project, {as: 'project', foreignKey: 'projectId'});

    // Relation 1-to-N between Client and Projects:
    Client.hasMany(Project, {as: 'projects', foreignKey: 'clientId'});
    Project.belongsTo(Client, {as: 'client', foreignKey: 'clientId'});

    // Relation 1-to-N between Developer(as consultant) and Projects:
    Developer.hasMany(Project, {as: 'consultantProjects', foreignKey: 'consultantId'});
    Project.belongsTo(Developer, {as: 'consultant', foreignKey: 'consultantId'});

    // Relation 1-to-N between Budget and Project
    Budget.hasMany(Project, {as: 'projects', foreignKey: 'budgetId'});
    Project.belongsTo(Budget, {as: 'budget', foreignKey: 'budgetId'});

    // Relation 1-to-N between DeliveryTime and Project
    DeliveryTime.hasMany(Project, {as: 'projects', foreignKey: 'deliveryTimeId'});
    Project.belongsTo(DeliveryTime, {as: 'deliveryTime', foreignKey: 'deliveryTimeId'});

    // Relation 1-to-N between ProjectType and Project
    ProjectType.hasMany(Project, {as: 'projects', foreignKey: 'projectTypeId'});
    Project.belongsTo(ProjectType, {as: 'projectType', foreignKey: 'projectTypeId'});

    // Relation 1-to-1 between milestone and role
    Role.hasMany(Milestone, {as: 'milestones', foreignKey: 'roleId'});
    Milestone.belongsTo(Role, {as: 'role', foreignKey: 'roleId'});

    // Relation 1-to-1 between milestone and proficiency
    Proficiency.hasMany(Milestone, {as: 'milestones', foreignKey: 'proficiencyId'});
    Milestone.belongsTo(Proficiency, {as: 'proficiency', foreignKey: 'proficiencyId'});

    // Relation 1-to-1 between Assignation and Milestone
    Milestone.hasOne(Assignation, {as: 'assignation', foreignKey: 'milestoneId'});
    Assignation.belongsTo(Milestone, {as: 'milestone', foreignKey: 'milestoneId'});

    // Relation 1-to-N between Developer and Assignation
    Developer.hasMany(Assignation, {as: 'assignations', foreignKey: 'developerId'});
    Assignation.belongsTo(Developer, {as: 'developer', foreignKey: 'developerId'});


      const projects = require("./projects/projects");

    for (const {title, description, summary, projectTypeId, state, url, budgetId, deliveryTimeId, deliveryDate,
      clientId, consultantId, objectives, constraints, milestones} of projects) {
      try {
        const project = await Project.create({
          title,
          description,
          summary,
          projectTypeId,
          state,
          url,
          budgetId,
          deliveryTimeId,
          deliveryDate,
          consultantId,
          clientId
        });
        for (const description of objectives) {
          const objective = await Objective.create({description});
          await project.addObjective(objective);
        }
        for (const description of constraints) {
          const constraint = await Constraint.create({description});
          await project.addConstraint(constraint);
        }
        for (const {title, description, budget, deliveryDate, deliveryTimeId, roleId, proficiencyId, assignation} of milestones) {
          const milestone = await Milestone.create({title, description, budget, deliveryTimeId, deliveryDate, roleId, proficiencyId});

          if (assignation) {
              console.log(">>>>>>>>>>>", JSON.stringify(assignation, undefined, 2));
              const _assignation = await Assignation.create(assignation);
              await milestone.setAssignation(_assignation);
          }

          await project.addMilestone(milestone);
        }
      } catch (error) {
        if (error instanceof Sequelize.ValidationError) {
          console.log('There are errors:');
          error.errors.forEach(({message}) => console.log(message));
        } else {
          console.log('Error creating project: ' + error.message);
        }
      }
    }
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Projects', null, {});
  }
};

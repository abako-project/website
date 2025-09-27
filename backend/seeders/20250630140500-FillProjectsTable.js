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
    const Task = require("../models/task")(sequelize);
    const Role = require("../models/role")(sequelize);
    const Budget = require("../models/budget")(sequelize);
    const DeliveryTime = require('../models/deliveryTime')(sequelize);
    const ProjectType = require('../models/projectType')(sequelize);

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

    // Relation 1-to-N between Milestone and Tasks
    Milestone.hasMany(Task, {as: 'tasks', foreignKey: 'milestoneId'});
    Task.belongsTo(Milestone, {as: 'milestone', foreignKey: 'milestoneId'});

    // Relation 1-to-N between Role and Tasks
    Role.hasMany(Task, {as: 'tasks', foreignKey: 'roleId'});
    Task.belongsTo(Role, {as: 'role', foreignKey: 'roleId'});

    // Relation 1-to-N between Budget and Project
    Budget.hasMany(Project, {as: 'projects', foreignKey: 'budgetId'});
    Project.belongsTo(Budget, {as: 'budget', foreignKey: 'budgetId'});

    // Relation 1-to-N between DeliveryTime and Project
    DeliveryTime.hasMany(Project, {as: 'projects', foreignKey: 'deliveryTimeId'});
    Project.belongsTo(DeliveryTime, {as: 'deliveryTime', foreignKey: 'deliveryTimeId'});

    // Relation 1-to-N between ProjectType and Project
    ProjectType.hasMany(Project, {as: 'projects', foreignKey: 'projectTypeId'});
    Project.belongsTo(ProjectType, {as: 'projectType', foreignKey: 'projectTypeId'});

    const projects = [
      {
        title: 'Servidor Quiz',
        description: 'Sevidor adivinanzas',
        summary: 'Servicio Web desarrollado con express',
        projectTypeId: 4,
        state: states.ProjectState.InProgress,
        url: 'https://quiz.dit.upm.es',
        budgetId: 1,
        deliveryTimeId: 4,
        deliveryDate: new Date(new Date().getTime() + (3 * 60 * 60 * 1000)),
        clientId: 1,
        consultantId: 1,
        objectives: [
          "Diseñar arquitectura",
          "Crear esqueleto del projecto",
          "Implementar MVC",
          "Pruebas"
        ],
        constraints: [
            "Usar solo librerias gratuitas",
            "Publicar en Moodle"
        ],
        milestones: [
          {
            title: 'Prototipo',
            description: 'Desarrollo de un prototipo',
            budget: '3000',
            deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
            tasks: [
              {
                title: 'Pt1',
                description: 'Tarea 1',
                budget: '2000',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 1
              },
              {
                title: 'PT2',
                description: 'Tarea 1Dos',
                budget: '1000',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 2
              }
            ]
          },
          {
            title: 'Producto Final',
            description: 'Desarrollo de un producto final',
            budget: '2000',
            deliveryDate: new Date(new Date().getTime() + (2 * 60 * 60 * 1000)),
            tasks: [
              {
                title: 'FT11',
                description: 'Tarea Subfinal 1',
                budget: '1000',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 1
              },
              {
                title: 'FT2',
                description: 'Tarea Subfinal 2',
                budget: '300',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 2
              },
              {
                title: 'FT3',
                description: 'Tarea Subfinal 3',
                budget: '700',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 2
              }
            ]
          },
        ]
      },
      {
        title: 'Gana el Último',
        description: 'SwiftUI App',
        summary: 'Aplicacion para iPhone',
        projectTypeId: 6,
        state: states.ProjectState.InProgress,
        url: 'https://dit.upm.es',
        budgetId: 2,
        deliveryTimeId: 4,
        deliveryDate: new Date(new Date().getTime() + (4 * 60 * 60 * 1000)),
        clientId: 1,
        consultantId: 2,
        objectives: [
          "Clonar ejemplo de IWEB",
          "Adaptar a SwiftUI 26"
        ],
        constraints: [
          "No subir nunca a la AppStore"
        ],
        milestones: [
          {
            title: 'Vistas',
            description: 'Desarrollo de las vistas',
            budget: '1000',
            deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
            tasks: [
              {
                title: 'Layout',
                description: 'Tarea Subfinal 1',
                budget: '500',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 1
              },
              {
                title: 'Vistas principales',
                description: 'Tarea Subfinal 2',
                budget: '300',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 2
              },
              {
                title: 'FT3',
                description: 'Parciales',
                budget: '200',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 2
              }
            ]
          },
          {
            title: 'Modelo',
            description: 'Desarrollo del modelo',
            budget: '1500',
            deliveryDate: new Date(new Date().getTime() + (2 * 60 * 60 * 1000)),
            tasks: [
              {
                title: 'Crear BBDD',
                description: 'Crear ls BBDD',
                budget: '1000',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 1
              },
              {
                title: 'Crear MIgraciones',
                description: 'Crear las Tablas',
                budget: '300',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 2
              },
              {
                title: 'Crear Seeder',
                description: 'Rellenar tablas',
                budget: '700',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 2
              }
            ]
          },
          {
            title: 'Controladores',
            description: 'Desarrollo de los controladores',
            budget: '2500',
            deliveryDate: new Date(new Date().getTime() + (4 * 60 * 60 * 1000)),
            tasks: [
              {
                title: 'C1',
                description: 'Tarea Controladores 1',
                budget: '1000',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 1
              },
              {
                title: 'C2',
                description: 'Tarea Controladores 2',
                budget: '1500',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 2
              }
            ]
          }
        ]
      },
      {
        title: 'SmarTerp',
        description: 'Servicio de Interpretes',
        summary: 'Proyecto de investigación para dessarrollar el MVP de un servicio blockchain',
        projectTypeId: 4,
        state: states.ProjectState.InProgress,
        url: 'https://kunveno.com',
        budgetId: 3,
        deliveryTimeId: 3,
        deliveryDate: new Date(new Date().getTime() + (5 * 60 * 60 * 1000)),
        clientId: 2,
        consultantId: 1,
        objectives: [
          "Desarrollar el back",
          "Desarrollar el front",
          "Validación de clientes"
        ],
        constraints: [
        ],
        milestones: [
          {
            title: 'Todito',
            description: 'Sin tonterias intermedias',
            budget: '75000',
            deliveryDate: new Date(new Date().getTime() + (5 * 60 * 60 * 1000)),
            tasks: [
              {
                title: 'Todito Tarea 1',
                description: 'Tarea Subfinal 1',
                budget: '25000',
                deliveryDate: new Date(new Date().getTime() + (1 * 60 * 60 * 1000)),
                roleId: 1
              },
              {
                title: 'Todito Tarea 2',
                description: 'Tarea Subfinal 2',
                budget: '10000',
                deliveryDate: new Date(new Date().getTime() + (3 * 60 * 60 * 1000)),
                roleId: 2
              },
              {
                title: 'FT3',
                title: 'Todito Tarea 3',
                budget: '40000',
                deliveryDate: new Date(new Date().getTime() + (5 * 60 * 60 * 1000)),
                roleId: 2
              }
            ]
          }
        ]
      }
    ];

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
        for (const {title, description, budget, deliveryDate, roleId, tasks} of milestones) {
          const milestone = await Milestone.create({title, description, budget, deliveryDate, roleId});

          for (const {title, description, budget, deliveryDate, roleId} of tasks) {
            const task = await Task.create({title, description, budget, deliveryDate, roleId});
            await milestone.addTask(task);
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

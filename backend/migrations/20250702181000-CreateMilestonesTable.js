'use strict';

const {DataTypes} = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Milestones',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                title: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Title must not be empty."}}
                },
                description: {
                    type: Sequelize.TEXT
                },
                budget: {
                    type: Sequelize.FLOAT
                },
                deliveryDate: {
                    type: Sequelize.DATE
                },
                displayOrder: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0
                },
                projectId: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "Projects",
                        key: "id"
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                },
                deliveryTimeId: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "DeliveryTimes",
                        key: "id"
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                },
                roleId: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "Roles",
                        key: "id"
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                proficiencyId: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "Proficiencies",
                        key: "id"
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                neededFullTimeDeveloper: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: true
                },
                neededPartTimeDeveloper: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                neededHourlyDeveloper: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                state: {
                    type: Sequelize.ENUM,
                    values: ['WaitingDeveloperAssignation', 'WaitingDeveloperAcceptAssignation',
                        'MilestoneInProgress', 'WaitingClientAcceptSubmission', "SubmissionRejectedByClient", "AwaitingPayment", "Paid"],
                    defaultValue: 'WaitingDeveloperAssignation'
                },
                documentation: {
                    type: Sequelize.TEXT
                },
                links: {
                    type: Sequelize.TEXT
                },
                developerId: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "Developers",
                        key: "id"
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'SET NULL'
                },
                createdAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                },
                updatedAt: {
                    type: Sequelize.DATE,
                    allowNull: false
                }
            },
            {
                sync: {force: true}
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Milestones');
    }
};

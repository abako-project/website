'use strict';

const {DataTypes} = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Projects',
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
        summary: {
          type: Sequelize.TEXT
        },
        state: {
          type: Sequelize.STRING
        },
        url: {
          type: Sequelize.STRING
        },
        deliveryDate: {
          type: Sequelize.DATE
        },
        clientId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Clients",
            key: "id"
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        consultantId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Developers",
            key: "id"
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        budgetId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Budgets",
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
        projectTypeId: {
          type: Sequelize.INTEGER,
          references: {
            model: "ProjectTypes",
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
    await queryInterface.dropTable('Projects');
  }
};

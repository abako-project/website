'use strict';

const {DataTypes} = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tasks',
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
        currency: {
          type: Sequelize.STRING
        },
        deliveryDate: {
          type: Sequelize.DATE
        },
        displayOrder: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        milestoneId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Milestones",
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
    await queryInterface.dropTable('Tasks');
  }
};

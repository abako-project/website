'use strict';

const {DataTypes} = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Objectives',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true
        },
        description: {
          type: Sequelize.STRING,
          validate: {notEmpty: {msg: "Description must not be empty."}},
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
    await queryInterface.dropTable('Objectives');
  }
};

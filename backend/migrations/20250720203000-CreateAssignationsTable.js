
'use strict';

const {DataTypes} = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Assignations',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true
        },
        comment: {
          type: Sequelize.TEXT
        },
        state: {
          type: Sequelize.ENUM,
          values: ['None', 'Pending', 'Accepted', 'Rejected'],
          defaultValue: 'None'
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
        taskId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Tasks",
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
    await queryInterface.dropTable('Assignations');
  }
};

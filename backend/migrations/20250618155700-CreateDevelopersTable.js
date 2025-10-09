'use strict';

const {DataTypes} = require("sequelize");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Developers',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
          unique: true
        },
        name: {
          type: Sequelize.STRING,
        },
        address: {
          type: Sequelize.TEXT
        },
        bio: {
          type: Sequelize.TEXT
        },
        background: {
          type: Sequelize.TEXT
        },
        experienceLevel: {
          type: Sequelize.ENUM,
          values: ['Beginner', 'Intermediate', 'Advanced']
        },
        githubUsername: {
          type: Sequelize.STRING
        },
        portfolioUrl: {
          type: Sequelize.STRING
        },
        location: {
          type: Sequelize.STRING
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Users",
            key: "id"
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
        attachmentId: {
          type: Sequelize.INTEGER,
          references: {
            model: "Attachments",
            key: "id"
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        isAvailableForHire: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        isAvailableFullTime: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        isAvailablePartTime: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        isAvailableHourly: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        availableHoursPerWeek: {
          type: Sequelize.INTEGER,
          defaultValue: 0
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
    await queryInterface.dropTable('Developers');
  }
};

'use strict';

module.exports = {

  up: async (queryInterface, Sequelize) => {

    await queryInterface.createTable(
      'MilestoneSkills',
      {
        milestoneId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          unique: "compositeKey",
          allowNull: false,
          references: {
            model: "Milestones",
            key: "id"
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        skillId: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          unique: "compositeKey",
          allowNull: false,
          references: {
            model: "Skills",
            key: "id"
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
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
      {sync: {force: true}}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('MilestoneSkills');
  }
};
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Proficiencies', [
      {
        description: 'Junior',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: 'Mid-Level',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: 'Senior',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Proficiencies', null, {});
  }
};

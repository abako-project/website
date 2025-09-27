'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('ProjectTypes', [
      {
        description: 'Other',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: 'Smart Contract',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: 'Frontend',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: 'MVP',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: 'Audit',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: 'Mobile App',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('ProjectTypes', null, {});
  }
};

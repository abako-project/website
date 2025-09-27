'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Budgets', [
      {
        description: 'Below $10,000',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: '$10,000 - $50,000',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: '$50,000 - $100,000',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: 'Above $100,000',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Budgets', null, {});
  }
};

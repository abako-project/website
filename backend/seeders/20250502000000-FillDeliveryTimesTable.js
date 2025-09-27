'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('DeliveryTimes', [
      {
        description: 'Within 1 month',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: '1-3 months from start',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: '3-6 months from start',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        description: 'Specific date',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('DeliveryTimes', null, {});
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Skills', [
      {
        name: 'Rust',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Javascript',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'HTML5',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Node',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'UX',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Skills', null, {});
  }
};

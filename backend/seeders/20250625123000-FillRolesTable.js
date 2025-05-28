'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {

        await queryInterface.bulkInsert('Roles', [
            {
                name: 'Front End',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'BackEnd',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Full Stack',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'UX Designer',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {

        await queryInterface.bulkDelete('Roles', null, {});
    }
};

'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(
            'Attachments',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                mime: {
                    type: Sequelize.STRING
                },
                image: {
                    type: Sequelize.BLOB('long')
                },
                clientId: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "Clients",
                        key: "id"
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE'
                },
                developerId: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "Developers",
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
            {
                sync: {force: true}
            }
        );
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('Attachments');
    }
};

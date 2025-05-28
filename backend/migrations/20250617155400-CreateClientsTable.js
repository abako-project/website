'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Clients',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                name: {
                    type: Sequelize.STRING
                },
                password: {
                    type: Sequelize.STRING,
                    validate: {notEmpty: {msg: "Password must not be empty."}}
                },
                salt: {
                    type: Sequelize.STRING
                },
                company: {
                    type: Sequelize.STRING
                },
                department: {
                    type: Sequelize.STRING
                },
                website: {
                    type: Sequelize.STRING
                },
                description: {
                    type: Sequelize.TEXT
                },
                city: {
                    type: Sequelize.STRING
                },
                country: {
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
        await queryInterface.dropTable('Clients');
    }
};

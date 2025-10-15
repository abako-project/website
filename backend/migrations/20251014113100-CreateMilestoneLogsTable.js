'use strict';

const {DataTypes} = require("sequelize");
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('MilestoneLogs',
            {
                id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                fromClient: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                fromConsultant: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                title: {
                    type: Sequelize.STRING,
                },
                msg: {
                    type: Sequelize.TEXT
                },
                showDeveloper: {
                    type: Sequelize.BOOLEAN,
                    defaultValue: false
                },
                milestoneId: {
                    type: Sequelize.INTEGER,
                    references: {
                        model: "Milestones",
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
        await queryInterface.dropTable('MilestoneLogs');
    }
};

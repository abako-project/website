'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class Milestone extends Model {
    }

    Milestone.init({
        title: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "Title must not be empty."}}
        },
        description: {
            type: DataTypes.TEXT
        },
        budget: {
            type: DataTypes.FLOAT
        },
        deliveryDate: {
            type: DataTypes.DATE
        },
        displayOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        neededFullTimeDeveloper: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        neededPartTimeDeveloper: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        neededHourlyDeveloper: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        state: {
            type: DataTypes.ENUM,
            values: ['WaitingDeveloperAssignation', 'WaitingDeveloperAcceptAssignation',
                'MilestoneInProgress', 'WaitingClientAcceptSubmission', "SubmissionRejectedByClient", "AwaitingPayment", "Paid"],
            defaultValue: 'WaitingDeveloperAssignation'
        },
        documentation: {
            type: DataTypes.TEXT
        },
        links: {
            type: DataTypes.TEXT
        }
    }, {
        sequelize,
    });

    // Hook para asignar displayOrder automáticamente al crear
    Milestone.beforeCreate(async milestone => {
        const max = await Milestone.max('displayOrder');
        milestone.displayOrder = (max || 0) + 1;
    });

    return Milestone;
};

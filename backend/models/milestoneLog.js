'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class MilestoneLog extends Model {
    }

    MilestoneLog.init({
        fromClient: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        fromConsultant: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        title: {
            type: DataTypes.STRING,
        },
        msg: {
            type: DataTypes.TEXT
        },
        showDeveloper: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        sequelize,
    });

    return MilestoneLog;
};

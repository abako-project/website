'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class Project extends Model {
    }

    Project.init({
        title: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "Title must not be empty."}}
        },
        summary: {
            type: DataTypes.TEXT
        },
        description: {
            type: DataTypes.TEXT
        },
        state: {
            type: DataTypes.STRING
        },
        url: {
            type: DataTypes.STRING
        },
        deliveryDate: {
            type: DataTypes.DATE
        }
    }, {
        sequelize,
    });

    return Project;
};

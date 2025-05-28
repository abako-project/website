'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class ProjectObjective extends Model {
    }

    ProjectObjective.init({

        description: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "Description must not be empty."}},
        }
    }, {
        sequelize,
    });

    return ProjectObjective;
};

'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class ProjectConstraint extends Model {
    }

    ProjectConstraint.init({

        description: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "Description must not be empty."}},
        }
    }, {
        sequelize,
    });

    return ProjectConstraint;
};

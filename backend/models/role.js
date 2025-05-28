'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class Role extends Model {
    }

    Role.init({
        name: {
            type: DataTypes.STRING,
            validate: {notEmpty: {msg: "Name must not be empty."}},
            unique: true
        }
    }, {
        sequelize,
    });

    return Role;
};

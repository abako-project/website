'use strict';

const {Model, DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    class User extends Model {
    }

    User.init({
        email: {
            type: DataTypes.STRING,
            unique: true,
            validate: {
                isEmail: {msg: "Invalid format email."}
            }
        }
    }, {
        sequelize,
    });

    return User;
};

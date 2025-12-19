'use strict';

const {Model, DataTypes} = require('sequelize');

// Definition of the Client model:
module.exports = (sequelize) => {

    class Client extends Model {}

    Client.init({
            name: {
                type: DataTypes.STRING,
            },
            password: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Password must not be empty."}},
            },
            salt: {
                type: DataTypes.STRING
            },
            company: {
                type: DataTypes.STRING
            },
            department: {
                type: DataTypes.STRING
            },
            website: {
                type: DataTypes.STRING
            },
            description: {
                type: DataTypes.TEXT
            },
            location: {
                type: DataTypes.STRING
            }
        }, {
            sequelize
        }
    );

    return Client;
};

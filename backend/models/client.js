'use strict';

const {Model, DataTypes} = require('sequelize');
const crypt = require('../helpers/crypt');

// Definition of the Client model:
module.exports = (sequelize) => {

    class Client extends Model {
        verifyPassword(password) {
            return crypt.encryptPassword(password, this.salt) === this.password;
        }
    }

    Client.init({
            name: {
                type: DataTypes.STRING,
            },
            password: {
                type: DataTypes.STRING,
                validate: {notEmpty: {msg: "Password must not be empty."}},
                set(password) {
                    // Random String used as salt.
                    this.salt = crypt.generateSalt();
                    this.setDataValue('password', crypt.encryptPassword(password, this.salt));
                }
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
